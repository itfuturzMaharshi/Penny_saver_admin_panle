export const SocketService = {
	disconnect(): void {
		try {
			// Optional: if a global socket instance exists, disconnect it
			const globalWindow = window as unknown as { socket?: { disconnect?: () => void } };
			globalWindow.socket?.disconnect?.();
		} catch {
			// No-op: safely ignore any disconnect errors
		}
	},
};

export default SocketService;


