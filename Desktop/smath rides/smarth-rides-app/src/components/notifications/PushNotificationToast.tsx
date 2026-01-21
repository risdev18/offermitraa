"use client"

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell } from 'lucide-react';
import { onMessageListener } from '@/lib/services/pushNotificationService';

interface NotificationToastProps {
    onClose?: () => void;
}

export default function PushNotificationToast({ onClose }: NotificationToastProps) {
    const [notification, setNotification] = useState<any>(null);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Listen for foreground messages
        const unsubscribe = onMessageListener((payload) => {
            console.log('Received foreground notification:', payload);
            setNotification(payload);
            setShow(true);

            // Auto-hide after 5 seconds
            setTimeout(() => {
                handleClose();
            }, 5000);
        });

        return () => {
            if (typeof unsubscribe === 'function') {
                unsubscribe();
            }
        };
    }, []);

    const handleClose = () => {
        setShow(false);
        setTimeout(() => {
            setNotification(null);
            onClose?.();
        }, 300);
    };

    const handleClick = () => {
        // Navigate to relevant page based on notification data
        if (notification?.data?.url) {
            window.location.href = notification.data.url;
        }
        handleClose();
    };

    return (
        <AnimatePresence>
            {show && notification && (
                <motion.div
                    initial={{ opacity: 0, y: -100, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -100, scale: 0.9 }}
                    className="fixed top-4 right-4 z-[9999] max-w-sm"
                >
                    <div
                        onClick={handleClick}
                        className="bg-slate-900 border border-primary/20 rounded-2xl shadow-2xl shadow-primary/10 p-4 cursor-pointer hover:border-primary/40 transition-all"
                    >
                        <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-primary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Bell className="h-5 w-5 text-primary" />
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-white font-black text-sm mb-1 truncate">
                                    {notification.notification?.title || 'New Notification'}
                                </h4>
                                <p className="text-slate-400 text-xs leading-relaxed line-clamp-2">
                                    {notification.notification?.body || notification.data?.message}
                                </p>
                                {notification.data?.type && (
                                    <span className="inline-block mt-2 text-[10px] font-bold uppercase tracking-widest text-primary/60">
                                        {notification.data.type.replace(/_/g, ' ')}
                                    </span>
                                )}
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleClose();
                                }}
                                className="h-6 w-6 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
                            >
                                <X className="h-4 w-4 text-slate-400" />
                            </button>
                        </div>

                        {/* Progress bar */}
                        <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: '0%' }}
                            transition={{ duration: 5, ease: 'linear' }}
                            className="h-1 bg-primary/40 rounded-full mt-3"
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
