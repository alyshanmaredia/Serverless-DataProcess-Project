import React, { useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export default function Dashboard() {
  return (
		<div className="flex items-center justify-center">
			<iframe
				height="720"
				src="https://lookerstudio.google.com/embed/reporting/11522645-8300-4ed9-8149-aa93e03d7851/page/YfOXE"
				style={{border:0}}
				className="w-[calc(100vw-256px)] h-[calc(100vh-76px)]"
				allowFullScreen
				sandbox="allow-storage-access-by-user-activation allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
			></iframe>
		</div>
  );
}
