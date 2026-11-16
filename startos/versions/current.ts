import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '1.20.1:1',
  releaseNotes: {
    en_US:
      'Fix intermittent shutdown hangs by propagating task cancellation during peer verification instead of retrying peer connections. Existing disconnected-session handling is preserved.',
    es_ES:
      'Corrige bloqueos intermitentes al apagar propagando la cancelación de tareas durante la verificación de pares en lugar de reintentar conexiones. Se mantiene el manejo de sesiones desconectadas.',
    de_DE:
      'Behebt gelegentliche Hänger beim Herunterfahren, indem Task-Abbrüche bei der Peer-Prüfung weitergegeben werden, statt Peer-Verbindungen erneut zu versuchen. Die Behandlung getrennter Sitzungen bleibt erhalten.',
    pl_PL:
      'Naprawia sporadyczne zawieszanie się podczas zamykania przez propagowanie anulowania zadania podczas weryfikacji peerów zamiast ponawiania połączeń. Obsługa rozłączonych sesji pozostaje bez zmian.',
    fr_FR:
      'Corrige les blocages intermittents à l’arrêt en propageant l’annulation des tâches pendant la vérification des pairs au lieu de réessayer les connexions. La gestion des sessions déconnectées est conservée.',
  },
  migrations: {
    up: async () => {},
    down: IMPOSSIBLE,
  },
})
