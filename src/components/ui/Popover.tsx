import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from "@/lib/utils";

interface PopoverProps {
    trigger: ReactNode;
    content: ReactNode;
    isOpen?: boolean;
    onOpenChange?: (open: boolean) => void;
    align?: 'start' | 'center' | 'end';
    side?: 'top' | 'bottom';
    className?: string;
}

export function Popover({
    trigger,
    content,
    isOpen: controlledOpen,
    onOpenChange,
    align = 'start',
    side = 'bottom',
    className
}: PopoverProps) {
    const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
    const isControlled = controlledOpen !== undefined;
    const open = isControlled ? controlledOpen : uncontrolledOpen;
    const setOpen = (newOpen: boolean) => {
        if (!isControlled) {
            setUncontrolledOpen(newOpen);
        }
        onOpenChange?.(newOpen);
    };

    const containerRef = useRef<HTMLDivElement>(null);
    const [coords, setCoords] = useState<{ top: number; left: number; width: number } | null>(null);

    useEffect(() => {
        const updatePosition = () => {
            if (containerRef.current && open) {
                const rect = containerRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom,
                    left: rect.left,
                    width: rect.width
                });
            }
        };

        if (open) {
            updatePosition();
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        }

        return () => {
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [open]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                // We also need to check if the click was inside the portal content
                // Since portal content is in body, we can't easily check ref here unless we forward it.
                // But typically, if we click outside the TRIGGER, we might want to close.
                // However, clicking inside the content should NOT close.
                // We can check if the target is inside a specific class or check logical containment.
                // For now, let's assume if it's NOT the trigger, we try to close.
                // BUT clicking the content is "outside" the trigger ref.
                // So we need a ref for the content too.
                const contentEl = document.getElementById(`popover-content-${uniqueId}`);
                if (contentEl && contentEl.contains(event.target as Node)) {
                    return;
                }
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    // Simple ID for connection
    const uniqueId = useState(() => Math.random().toString(36).substr(2, 9))[0];

    // Calculate generic transforms based on alignment
    const xTransform = align === 'center' ? '-50%' : align === 'end' ? '-100%' : '0%';
    const xOffset = align === 'end' && coords ? coords.width : align === 'center' && coords ? coords.width / 2 : 0;

    // Adjust left based on alignment
    const adjustedLeft = coords ? coords.left + xOffset : 0;

    return (
        <div className="relative inline-block" ref={containerRef}>
            <div onClick={() => setOpen(!open)} className="cursor-pointer">
                {trigger}
            </div>
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                    {open && coords && (
                        <motion.div
                            id={`popover-content-${uniqueId}`}
                            initial={{ opacity: 0, y: side === 'bottom' ? -5 : 5, scale: 0.95, x: xTransform }}
                            animate={{ opacity: 1, y: 0, scale: 1, x: xTransform }}
                            exit={{ opacity: 0, y: side === 'bottom' ? -5 : 5, scale: 0.95, x: xTransform }}
                            transition={{ duration: 0.1 }}
                            style={{
                                position: 'fixed',
                                top: side === 'bottom' ? coords.top + 8 : undefined, // +8 for offset
                                bottom: side === 'top' ? (window.innerHeight - (coords.top - 40)) : undefined, // Approximate for top side if needed, but we mostly use bottom
                                left: adjustedLeft,
                                zIndex: 9999, // High z-index
                            }}
                            className={cn(
                                "min-w-[200px] bg-popover text-popover-foreground border border-border rounded-xl shadow-xl p-2",
                                className
                            )}
                        >
                            {content}
                        </motion.div>
                    )}
                </AnimatePresence>,
                document.body
            )}
        </div>
    );
}
