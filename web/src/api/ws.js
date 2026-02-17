/**
 * WebSocket client for node editing lock management.
 * Handles connection, reconnection, heartbeat, and lock/unlock messaging.
 */

const RECONNECT_INTERVAL = 3000
const HEARTBEAT_INTERVAL = 30000

export default class MindMapWS {
  constructor(mindmapId) {
    this.mindmapId = mindmapId
    this.ws = null
    this.reconnectTimer = null
    this.heartbeatTimer = null
    this.closed = false

    // Callbacks
    this.onNodeLocked = null     // (nodeUid, lockedBy) => {}
    this.onNodeUnlocked = null   // (nodeUid) => {}
    this.onLockStateSync = null  // (locks) => {}
    this.onLockSuccess = null    // (nodeUid) => {}
    this.onLockFailed = null     // (nodeUid, lockedBy) => {}
    this.onConnected = null      // () => {}
    this.onDisconnected = null   // () => {}
  }

  connect() {
    if (this.closed) return
    const token = localStorage.getItem('access_token')
    if (!token) return

    const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const url = `${protocol}//${location.host}/api/ws/${this.mindmapId}?token=${token}`

    this.ws = new WebSocket(url)

    this.ws.onopen = () => {
      this.startHeartbeat()
      if (this.onConnected) this.onConnected()
    }

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        this.handleMessage(data)
      } catch (e) {
        // ignore malformed messages
      }
    }

    this.ws.onclose = () => {
      this.stopHeartbeat()
      if (this.onDisconnected) this.onDisconnected()
      if (!this.closed) {
        this.scheduleReconnect()
      }
    }

    this.ws.onerror = () => {
      // onclose will fire after onerror
    }
  }

  handleMessage(data) {
    switch (data.type) {
      case 'pong':
        break
      case 'lock_state_sync':
        if (this.onLockStateSync) this.onLockStateSync(data.locks)
        break
      case 'lock_success':
        if (this.onLockSuccess) this.onLockSuccess(data.node_uid)
        break
      case 'lock_failed':
        if (this.onLockFailed) this.onLockFailed(data.node_uid, data.locked_by)
        break
      case 'node_locked':
        if (this.onNodeLocked) this.onNodeLocked(data.node_uid, data.locked_by)
        break
      case 'node_unlocked':
        if (this.onNodeUnlocked) this.onNodeUnlocked(data.node_uid)
        break
    }
  }

  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data))
    }
  }

  lockNode(nodeUid) {
    this.send({ type: 'lock_node', node_uid: nodeUid })
  }

  unlockNode(nodeUid) {
    this.send({ type: 'unlock_node', node_uid: nodeUid })
  }

  startHeartbeat() {
    this.stopHeartbeat()
    this.heartbeatTimer = setInterval(() => {
      this.send({ type: 'ping' })
    }, HEARTBEAT_INTERVAL)
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = null
    }
  }

  scheduleReconnect() {
    if (this.reconnectTimer) return
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null
      this.connect()
    }, RECONNECT_INTERVAL)
  }

  close() {
    this.closed = true
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}
