"""
Simple HTTP server to serve the dashboard
Run this to access the dashboard at http://localhost:8000
"""

import io
import sys

# Fix Windows console encoding
if sys.stdout.encoding != 'utf-8':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
    sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8')

import http.server
import socketserver
import os
from pathlib import Path

PORT = 8000
DASHBOARD_PATH = Path(__file__).parent / 'dashboard.html'

class DashboardHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/' or self.path == '':
            self.path = '/dashboard.html'
        
        if self.path == '/dashboard.html':
            try:
                with open(DASHBOARD_PATH, 'r', encoding='utf-8') as f:
                    content = f.read()
                self.send_response(200)
                self.send_header('Content-type', 'text/html; charset=utf-8')
                self.end_headers()
                self.wfile.write(content.encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.end_headers()
                self.wfile.write(f'Error: {str(e)}'.encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    with socketserver.TCPServer(("", 8001), DashboardHandler) as httpd:
        print(f"\n{'='*80}")
        print("DASHBOARD SERVER")
        print(f"{'='*80}")
        print(f"\n✓ Dashboard available at: http://localhost:8001")
        print(f"✓ API running at: http://localhost:5000")
        print(f"\nPress CTRL+C to stop\n")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nDashboard server stopped")
