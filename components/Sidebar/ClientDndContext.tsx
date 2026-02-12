'use client';

import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, MouseSensor, TouchSensor, useSensor, useSensors, pointerWithin, closestCorners } from '@dnd-kit/core';

export default function ClientDndContext({
    children,
    onDragEnd,
    onDragStart
}: {
    children: React.ReactNode,
    onDragEnd: (event: DragEndEvent) => void,
    onDragStart?: (event: DragStartEvent) => void
}) {
    const [isMounted, setIsMounted] = useState(false);

    const mouseSensor = useSensor(MouseSensor, {
        activationConstraint: {
            distance: 10,
        },
    });

    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 250,
            tolerance: 5,
        },
    });

    const sensors = useSensors(mouseSensor, touchSensor);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) {
        return <>{children}</>;
    }

    return (
        <DndContext id="file-explorer-dnd" sensors={sensors} collisionDetection={pointerWithin} onDragEnd={onDragEnd} onDragStart={onDragStart}>
            {children}
        </DndContext>
    );
}
