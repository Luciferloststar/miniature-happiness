import React, { useState, useEffect, useRef } from 'react';
import { X, Maximize, Minimize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentViewerProps {
    fileURL: string;
    fileName: string;
    onClose: () => void;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ fileURL, fileName, onClose }) => {
    const [isFullScreen, setIsFullScreen] = useState(false);
    const viewerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Prevent background scrolling and add print protection class
        document.body.style.overflow = 'hidden';
        
        const handleFullScreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullScreenChange);

        // Cleanup
        return () => {
            document.body.style.overflow = 'auto';
            document.removeEventListener('fullscreenchange', handleFullScreenChange);
        };
    }, []);

    const toggleFullScreen = () => {
        if (!viewerRef.current) return;

        if (!document.fullscreenElement) {
            viewerRef.current.requestFullscreen().catch(err => {
                alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    const isViewableInIframe = /\.(pdf|html|txt|md)$/i.test(fileName);

    return (
        <motion.div
            ref={viewerRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex flex-col p-4 md:p-8"
            aria-modal="true"
            role="dialog"
        >
            {/* Header */}
            <div className="flex-shrink-0 bg-gray-900/80 rounded-t-lg p-3 flex justify-between items-center border-b border-yellow-800">
                <h2 className="text-lg font-bold text-yellow-300 truncate pr-4">{fileName}</h2>
                <div className="flex items-center space-x-2">
                    <button onClick={toggleFullScreen} className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-full transition-colors" title={isFullScreen ? "Exit Fullscreen" : "Maximize"}>
                        {isFullScreen ? <Minimize size={20} /> : <Maximize size={20} />}
                    </button>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-white hover:bg-red-600 rounded-full transition-colors" title="Close">
                        <X size={20} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-grow bg-gray-900/80 rounded-b-lg p-2 relative overflow-hidden" onContextMenu={(e) => e.preventDefault()}>
                {isViewableInIframe ? (
                     <iframe
                        src={fileURL}
                        title={fileName}
                        className="w-full h-full border-0"
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-center p-4">
                         <h3 className="text-2xl text-yellow-400">Preview Not Available</h3>
                         <p className="text-gray-400 mt-2">
                             Files of type <span className="font-bold">.{fileName.split('.').pop()}</span> cannot be previewed directly for security reasons.
                         </p>
                         <a 
                             href={fileURL} 
                             download={fileName}
                             className="mt-6 bg-yellow-500 text-black font-bold py-2 px-6 rounded-lg hover:bg-yellow-600 transition-all duration-300"
                         >
                             Download {fileName}
                         </a>
                    </div>
                )}
                 {/* Protection Overlay */}
                 <div className="absolute inset-0 select-none pointer-events-none" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}></div>
            </div>
             <div className="text-center text-xs text-gray-500 pt-2">
                This content is protected. Copying and screenshots are disabled.
            </div>
        </motion.div>
    );
};

export default DocumentViewer;
