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

  // Acciones sobre un mensaje (copiar/fijar/editar/eliminar)
  accion = signal<string | null>(null);
  private accionTimer: ReturnType<typeof setTimeout> | null = null;
  editandoId = signal<number | null>(null);
  textoEdit = '';

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

  // Carga usuarios y mensajes, y arranca el sondeo de mensajes nuevos.
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

  // Al salir, detiene el sondeo y limpia los temporizadores.
  ngOnDestroy() {
    if (this.poll) {
      clearInterval(this.poll);
    }
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
  }

  // Carga los mensajes recibidos y enviados.
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

  // Muestra el toast de "mensaje nuevo" durante 3 segundos.
  private mostrarToast(nombre: string, texto: string) {
    const corto = texto.length > 60 ? texto.slice(0, 60) + '…' : texto;
    this.toast.set({ nombre, texto: corto });
    if (this.toastTimer) {
      clearTimeout(this.toastTimer);
    }
    this.toastTimer = setTimeout(() => this.toast.set(null), 3000);
  }

  // Muestra un aviso corto de acción (copiado, fijado, etc.) por 2 segundos.
  private avisar(txt: string) {
    this.accion.set(txt);
    if (this.accionTimer) {
      clearTimeout(this.accionTimer);
    }
    this.accionTimer = setTimeout(() => this.accion.set(null), 2000);
  }

  // Reemplaza un mensaje por su versión actualizada en ambas listas.
  private reemplazarMsg(u: Mensaje) {
    this.recibidos.update((l) => l.map((x) => (x.id === u.id ? u : x)));
    this.enviados.update((l) => l.map((x) => (x.id === u.id ? u : x)));
  }

  // Copia el texto del mensaje al portapapeles.
  copiar(m: Mensaje) {
    navigator.clipboard
      ?.writeText(m.contenido ?? '')
      .then(() => this.avisar('Mensaje copiado'))
      .catch(() => this.avisar('No se pudo copiar'));
  }

  // Fija o desfija el mensaje.
  fijar(m: Mensaje) {
    this.service.fijarMensaje(m.id, !m.fijado).subscribe({
      next: (u) => {
        this.reemplazarMsg(u);
        this.avisar(u.fijado ? 'Mensaje fijado' : 'Mensaje desfijado');
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo fijar'),
    });
  }

  // Elimina el mensaje de la conversación.
  eliminar(m: Mensaje) {
    this.service.eliminarMensaje(m.id).subscribe({
      next: () => {
        this.recibidos.update((l) => l.filter((x) => x.id !== m.id));
        this.enviados.update((l) => l.filter((x) => x.id !== m.id));
        this.avisar('Mensaje eliminado');
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo eliminar'),
    });
  }

  // ¿Puedo editar este mensaje? (mío y dentro de los 15 min)
  puedeEditar(m: Mensaje): boolean {
    if (m.remitente_id !== this.miId()) {
      return false;
    }
    const iso =
      m.created_at.endsWith('Z') || m.created_at.includes('+') ? m.created_at : m.created_at + 'Z';
    return Date.now() - new Date(iso).getTime() < 15 * 60 * 1000;
  }

  // Abre el cuadro para editar el mensaje.
  editar(m: Mensaje) {
    this.editandoId.set(m.id);
    this.textoEdit = m.contenido ?? '';
  }

  // Cancela la edición del mensaje.
  cancelarEdicion() {
    this.editandoId.set(null);
  }

  // Guarda el mensaje editado.
  guardarEdicion(m: Mensaje) {
    const t = this.textoEdit.trim();
    if (!t) {
      return;
    }
    this.service.editarMensaje(m.id, t).subscribe({
      next: (u) => {
        this.reemplazarMsg(u);
        this.editandoId.set(null);
      },
      error: (e) => this.error.set(e?.error?.detail ?? 'No se pudo editar'),
    });
  }

  // Abre la conversación con un contacto y marca sus mensajes como leídos.
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

  // Nombre del usuario por su id (para mostrar en el chat).
  nombre(id: number) {
    return this.usuarios().find((u) => u.id === id)?.full_name ?? 'Usuario #' + id;
  }

  // Cuántos mensajes sin leer hay de un contacto.
  noLeidos(contactoId: number): number {
    return this.recibidos().filter((m) => m.remitente_id === contactoId && !m.leido).length;
  }

  // ¿El adjunto es un audio? (por la extensión del archivo).
  esAudio(nombre?: string | null): boolean {
    if (!nombre) {
      return false;
    }
    return /\.(mp3|wav|ogg|m4a|aac|opus)$/i.test(nombre);
  }

  // Guarda el archivo elegido para adjuntar al mensaje.
  seleccionarArchivo(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.archivo.set(input.files?.[0] ?? null);
    input.value = ''; // permite volver a elegir el mismo archivo
  }

  // Quita el archivo adjunto.
  quitarArchivo() {
    this.archivo.set(null);
  }

  // Envía el mensaje (sube el adjunto primero si lo hay).
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

  // Crea el mensaje (con adjunto opcional), limpia el formulario y recarga.
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
