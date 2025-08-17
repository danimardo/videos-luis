-- Video Markers Database Initialization
-- This script runs automatically when the MariaDB container starts for the first time

USE video_markers;

-- Create the video_markers table if it doesn't exist
CREATE TABLE IF NOT EXISTS video_markers (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255),
    url VARCHAR(1024) NOT NULL,
    seconds INT NOT NULL,
    note TEXT,
    created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_video_markers_created ON video_markers(created);
CREATE INDEX IF NOT EXISTS idx_video_markers_url ON video_markers(url(255));

-- Insert some sample data (optional - remove if not needed)
INSERT IGNORE INTO video_markers (id, title, url, seconds, note, created) VALUES
('sample_1', 'Tutorial Docker', 'https://www.youtube.com/watch?v=3c-iBn73dDE', 300, 'Introducción a contenedores', NOW()),
('sample_2', 'Curso Node.js', 'https://www.youtube.com/watch?v=BhvLIzVL8_o', 1200, 'Configuración del servidor Express', NOW());

-- Grant additional permissions if needed
GRANT SELECT, INSERT, UPDATE, DELETE ON video_markers.* TO 'appuser'@'%';
FLUSH PRIVILEGES;
