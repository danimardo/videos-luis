// Video Markers App - Frontend JavaScript

class VideoMarkersApp {
    constructor() {
        this.markers = [];
        this.editingId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadMarkers();
    }

    bindEvents() {
        // Form submission
        document.getElementById('form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveMarker();
        });

        // Export/Import/Clear buttons
        document.getElementById('btnExport').addEventListener('click', () => this.exportMarkers());
        document.getElementById('btnImport').addEventListener('click', () => this.importMarkers());
        document.getElementById('btnClear').addEventListener('click', () => this.clearMarkers());
        document.getElementById('btnPreview').addEventListener('click', () => this.previewLink());

        // File import
        document.getElementById('fileImport').addEventListener('change', (e) => this.handleFileImport(e));
    }

    // Convert time string to seconds
    timeToSeconds(timeStr) {
        if (!timeStr) return 0;
        
        // If it's already a number, return it
        if (!isNaN(timeStr)) return parseInt(timeStr);
        
        const parts = timeStr.split(':').map(p => parseInt(p));
        
        if (parts.length === 3) {
            // hh:mm:ss
            return parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            // mm:ss
            return parts[0] * 60 + parts[1];
        } else {
            // Just seconds
            return parseInt(timeStr) || 0;
        }
    }

    // Convert seconds to time string
    secondsToTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
    }

    // Generate YouTube URL with timestamp
    generateVideoUrl(url, seconds) {
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const separator = url.includes('?') ? '&' : '?';
            return `${url}${separator}t=${seconds}s`;
        }
        return url; // For non-YouTube videos, return original URL
    }

    // Show feedback message
    showFeedback(message, type = 'info') {
        const feedback = document.getElementById('feedback');
        feedback.textContent = message;
        feedback.className = `hint ${type}`;
        setTimeout(() => {
            feedback.textContent = '';
            feedback.className = 'hint';
        }, 3000);
    }

    // Generate unique ID
    generateId() {
        return 'marker_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Save marker (create or update)
    async saveMarker() {
        const title = document.getElementById('title').value.trim();
        const url = document.getElementById('url').value.trim();
        const timeStr = document.getElementById('time').value.trim();
        const note = document.getElementById('note').value.trim();

        if (!url || !timeStr) {
            this.showFeedback('URL y tiempo son requeridos', 'warn');
            return;
        }

        const seconds = this.timeToSeconds(timeStr);
        if (seconds < 0) {
            this.showFeedback('Formato de tiempo inválido', 'warn');
            return;
        }

        const markerData = {
            id: this.editingId || this.generateId(),
            title: title || null,
            url,
            seconds,
            note: note || null
        };

        try {
            let response;
            if (this.editingId) {
                // Update existing marker
                response = await fetch(`/markers/${this.editingId}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(markerData)
                });
            } else {
                // Create new marker
                response = await fetch('/markers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(markerData)
                });
            }

            if (response.ok) {
                this.showFeedback(this.editingId ? 'Marcador actualizado' : 'Marcador guardado', 'ok');
                this.resetForm();
                this.loadMarkers();
            } else {
                throw new Error('Error en el servidor');
            }
        } catch (error) {
            console.error('Error saving marker:', error);
            this.showFeedback('Error al guardar marcador', 'err');
        }
    }

    // Load all markers from server
    async loadMarkers() {
        try {
            const response = await fetch('/markers');
            if (response.ok) {
                this.markers = await response.json();
                this.renderMarkers();
            } else {
                throw new Error('Error loading markers');
            }
        } catch (error) {
            console.error('Error loading markers:', error);
            this.showFeedback('Error al cargar marcadores', 'err');
        }
    }

    // Render markers list
    renderMarkers() {
        const list = document.getElementById('list');
        
        if (this.markers.length === 0) {
            list.innerHTML = '<div class="empty">No hay marcadores guardados</div>';
            return;
        }

        list.innerHTML = this.markers.map(marker => {
            const timeStr = this.secondsToTime(marker.seconds);
            const date = new Date(marker.created).toLocaleDateString('es-ES');
            const videoUrl = this.generateVideoUrl(marker.url, marker.seconds);
            
            return `
                <div class="item">
                    <div>
                        <div style="font-weight: 600; margin-bottom: 4px;">
                            ${marker.title || 'Sin título'}
                        </div>
                        <div class="small">
                            <a href="${videoUrl}" target="_blank" style="color: var(--acc); text-decoration: none;">
                                ${marker.url.length > 50 ? marker.url.substring(0, 50) + '...' : marker.url}
                            </a>
                        </div>
                    </div>
                    <div>
                        <span class="badge mono">${timeStr}</span>
                    </div>
                    <div class="small">${date}</div>
                    <div class="small">${marker.note || ''}</div>
                    <div class="tools">
                        <button class="ghost" onclick="app.editMarker('${marker.id}')">Editar</button>
                        <button class="danger" onclick="app.deleteMarker('${marker.id}')">Eliminar</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Edit marker
    editMarker(id) {
        const marker = this.markers.find(m => m.id === id);
        if (!marker) return;

        document.getElementById('title').value = marker.title || '';
        document.getElementById('url').value = marker.url;
        document.getElementById('time').value = this.secondsToTime(marker.seconds);
        document.getElementById('note').value = marker.note || '';
        
        this.editingId = id;
        this.showFeedback('Editando marcador...', 'warn');
        
        // Change button text
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Actualizar';
    }

    // Delete marker
    async deleteMarker(id) {
        if (!confirm('¿Estás seguro de eliminar este marcador?')) return;

        try {
            const response = await fetch(`/markers/${id}`, { method: 'DELETE' });
            if (response.ok) {
                this.showFeedback('Marcador eliminado', 'ok');
                this.loadMarkers();
            } else {
                throw new Error('Error deleting marker');
            }
        } catch (error) {
            console.error('Error deleting marker:', error);
            this.showFeedback('Error al eliminar marcador', 'err');
        }
    }

    // Reset form
    resetForm() {
        document.getElementById('form').reset();
        this.editingId = null;
        const submitBtn = document.querySelector('button[type="submit"]');
        submitBtn.textContent = 'Guardar';
    }

    // Preview link
    previewLink() {
        const url = document.getElementById('url').value.trim();
        const timeStr = document.getElementById('time').value.trim();
        
        if (!url) {
            this.showFeedback('Ingresa una URL primero', 'warn');
            return;
        }

        const seconds = this.timeToSeconds(timeStr);
        const finalUrl = this.generateVideoUrl(url, seconds);
        window.open(finalUrl, '_blank');
    }

    // Export markers to JSON
    exportMarkers() {
        if (this.markers.length === 0) {
            this.showFeedback('No hay marcadores para exportar', 'warn');
            return;
        }

        const dataStr = JSON.stringify(this.markers, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `video-markers-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showFeedback('Marcadores exportados', 'ok');
    }

    // Import markers
    importMarkers() {
        document.getElementById('fileImport').click();
    }

    // Handle file import
    async handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedMarkers = JSON.parse(text);
            
            if (!Array.isArray(importedMarkers)) {
                throw new Error('Formato de archivo inválido');
            }

            // Import each marker
            for (const marker of importedMarkers) {
                marker.id = this.generateId(); // Generate new ID to avoid conflicts
                await fetch('/markers', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(marker)
                });
            }

            this.showFeedback(`${importedMarkers.length} marcadores importados`, 'ok');
            this.loadMarkers();
        } catch (error) {
            console.error('Error importing markers:', error);
            this.showFeedback('Error al importar archivo', 'err');
        }
        
        // Reset file input
        event.target.value = '';
    }

    // Clear all markers
    async clearMarkers() {
        if (!confirm('¿Estás seguro de eliminar TODOS los marcadores? Esta acción no se puede deshacer.')) return;

        try {
            // Delete all markers one by one
            for (const marker of this.markers) {
                await fetch(`/markers/${marker.id}`, { method: 'DELETE' });
            }
            
            this.showFeedback('Todos los marcadores eliminados', 'ok');
            this.loadMarkers();
        } catch (error) {
            console.error('Error clearing markers:', error);
            this.showFeedback('Error al eliminar marcadores', 'err');
        }
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new VideoMarkersApp();
});
