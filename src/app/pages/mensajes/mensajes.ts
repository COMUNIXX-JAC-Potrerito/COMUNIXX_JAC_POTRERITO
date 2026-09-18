import { DatePipe } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Mensaje, Usuario } from '../../models/comunicacion.model';
import { AuthService } from '../../services/auth.service';
import { ComunicacionService } from '../../services/comunicacion.service';
import { UploadService } from '../../services/upload.service';

// Mensaje anotado con si es mío (para pintar la burbuja a un lado u otro).
interface Burbuja extends Mensaje {
  mio: boolean;
}

@Component({
  selector: 'app-mensajes',
  imports: [FormsModule, DatePipe],
  templateUrl: './mensajes.html',
  styleUrl: './mensajes.scss',
})
export class Mensajes implements OnInit, OnDestroy {
  private service = inject(ComunicacionService);
  private uploads = inject(UploadService);
  private auth = inject(AuthService);

  usuarios = signal<Usuario[]>([]);
  recibidos = signal<Mensaje[]>([]);
  enviados = signal<Mensaje[]>([]);
  miId = signal<number | null>(null);
  contactoSel = signal<number | null>(null);

  texto = '';
  archivo = signal<File | null>(null);
  subiendo = signal(false);
  enviando = signal(false);
  error = signal<string | null>(null);

  // Notificación emergente (toast) de mensaje nuevo.
  toast = signal<{ nombre: string; texto: string } | null>(null);
  private ultimoId = 0;
  private poll: ReturnType<typeof setInterval> | null = null;
  private toastTimer: ReturnType<typeof setTimeout> | null = null;

  // Contactos con los que se puede chatear = SOLO dignatarios (admin/superadmin), distintos de mí.
  contactos = computed(() =>
    this.usuarios().filter(
      (u) =>
        u.id !== this.miId() &&
        (u.role === 'administrador' || u.role === 'superadministrador'),
    ),
  );

  // Conversación con el contacto seleccionado, en ambos sentidos y orden cronológico.
  conversacion = computed<Burbuja[]>(() => {
    const c = this.contactoSel();
    if (c === null) {
      return [];
    }
    const mios: Burbuja[] = this.enviados()
      .filter((m) => m.destinatario_id === c)
      .map((m) => ({ ...m, mio: true }));
    const suyos: Burbuja[] = this.recibidos()
      .filter((m) => m.remitente_id === c)
      .map((m) => ({ ...m, mio: false }));
    return [...mios, ...suyos].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  });

  ngOnInit() {
    this.service.usuarios().subscribe((u) => {
      this.usuarios.set(u);
      const correo = this.auth.emailActual();
      this.miId.set(u.find((x) => x.email === correo)?.id ?? null);
    });
    this.cargar();
    // Revisa si llegan mensajes nuevos cada 10 segundos.
    this.poll = setInterval(() => this.revisarNuevos(), 10000);
  }

  ngOnDestroy() {
    if (this.poll) {
      clearInterval(this.poll);
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  cargar() {
    this.service.recibidos().subscribe((m) => {
      this.recibidos.set(m);
      this.ultimoId = m.reduce((max, x) => Math.max(max, x.id), this.ultimoId);
    });
    this.service.enviados().subscribe((m) => this.enviados.set(m));
  }

  // Sondeo: detecta mensajes recibidos nuevos y muestra el toast.
  private revisarNuevos() {
    this.service.recibidos().subscribe((m) => {
      const nuevos = m.filter((x) => x.id > this.ultimoId);
      this.recibidos.set(m);
      if (nuevos.length > 0) {
        this.ultimoId = m.reduce((max, x) => Math.max(max, x.id), this.ultimoId);
        const ultimo = nuevos.sort((a, b) => b.id - a.id)[0];
        const preview = ultimo.contenido?.trim()
          ? ultimo.contenido
          : ultimo.adjunto_url
            ? 'te envió un archivo'
            : 'te escribió';
        this.mostrarToast(this.nombre(ultimo.remitente_id), preview);
      }
    });
    this.service.enviados().subscribe((m) => this.enviados.set(m));
  }

  private mostrarToast(nombre: string, texto: string) {
    const corto = texto.length > 60 ? texto.slice(0, 60) + '…' : texto;
    this.toast.set({ nombre, texto: corto });
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }

  seleccionar(id: number) {
    this.contactoSel.set(id);
    // Marca como leídos los mensajes recibidos de ese contacto.
    const pendientes = this.recibidos().filter((m) => m.remitente_id === id && !m.leido);
    if (pendientes.length > 0) {
      pendientes.forEach((m) =>
        this.service.marcarLeido(m.id).subscribe(() => {
          this.recibidos.update((lista) =>
            lista.map((x) => (x.id === m.id ? { ...x, leido: true } : x)),
          );
        }),
      );
    }
  }

  nombre(id: number) {
    return this.usuarios().find((u) => u.id === id)?.full_name ?? 'Usuario #' + id;
  }

  noLeidos(contactoId: number): number {
    return this.recibidos().filter((m) => m.remitente_id === contactoId && !m.leido).length;
  }

  esAudio(nombre?: string | null): boolean {
    if (!nombre) {
      return false;
    }
    return /\.(mp3|wav|ogg|m4a|aac|opus)$/i.test(nombre);
  }

  seleccionarArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.archivo.set(input.files?.[0] ?? null);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  quitarArchivo() {
    this.archivo.set(null);
  }

  enviar() {
    const dest = this.contactoSel();
    if (dest === null) {
      return;
    }
    const file = this.archivo();
    if (!this.texto.trim() && !file) {
      return;
    }

    this.error.set(null);
    this.enviando.set(true);

    if (file) {
      this.subiendo.set(true);
      this.uploads.subir(file).subscribe({
        next: (adj) => {
          this.subiendo.set(false);
          this.enviarMensaje(dest, adj.url, adj.tipo, adj.nombre);
        },
        error: (e) => {
          this.subiendo.set(false);
          this.enviando.set(false);
          this.error.set(e?.error?.detail ?? 'No se pudo subir el archivo');
        },
      });
    } else {
      this.enviarMensaje(dest, null, null, null);
    }
  }

  private enviarMensaje(
    dest: number,
    url: string | null,
    tipo: string | null,
    nombre: string | null,
  ) {
    this.service
      .enviarMensaje({
        destinatario_id: dest,
        contenido: this.texto,
        adjunto_url: url,
        adjunto_tipo: tipo,
        adjunto_nombre: nombre,
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.texto = '';
          this.archivo.set(null);
          this.cargar();
        },
        error: (e) => {
          this.enviando.set(false);
          this.error.set(e?.error?.detail ?? 'No se pudo enviar');
        },
      });
  }
}
