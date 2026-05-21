import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../store/useStore';
import { EffortCardDialog } from './Dialogs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { EffortCard } from '../domain/types';

// Helper to format dates consistently (YYYY-MM-DD)
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

const getDayName = (date: Date): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[date.getDay()];
};

const formatDuration = (totalMinutes: number): string => {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
};

const HOUR_HEIGHT = 240;

export const CalendarPanel: React.FC = () => {
  const { effortCards, addEffortCard, updateEffortCard, deleteEffortCard } = useStore();

  const [viewType, setViewType] = useState<1 | 2 | 3>(3);
  const [anchorDate, setAnchorDate] = useState<Date>(new Date());
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<EffortCard | null>(null);
  const [defaultDate, setDefaultDate] = useState<string>('');
  const [defaultTime, setDefaultTime] = useState<string>('');

  // Drag and resize active states
  const [activeDrag, setActiveDrag] = useState<{
    cardId: string;
    type: 'move' | 'resize-bottom' | 'resize-top';
    initialY: number;
    initialX: number;
    initialTop: number;
    initialHeight: number;
    initialDateIdx: number;
  } | null>(null);

  // Time tracker for current timeline indicator
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  
  // Ref for scroll grid positioning
  const timeGridRef = useRef<HTMLDivElement>(null);
  const hasDraggedRef = useRef(false);

  // Update current time indicator line
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Scroll to morning hours (e.g., 7:00 AM) on load
  useEffect(() => {
    if (timeGridRef.current) {
      // 7 AM is 7 * HOUR_HEIGHT
      timeGridRef.current.scrollTop = 7 * HOUR_HEIGHT;
    }
  }, []);

  // Get dates to render based on viewType and anchorDate
  const getDatesToRender = (): Date[] => {
    const dates: Date[] = [];
    if (viewType === 1) {
      dates.push(new Date(anchorDate));
    } else if (viewType === 2) {
      const tomorrow = new Date(anchorDate);
      tomorrow.setDate(anchorDate.getDate() + 1);
      dates.push(new Date(anchorDate), tomorrow);
    } else if (viewType === 3) {
      const yesterday = new Date(anchorDate);
      yesterday.setDate(anchorDate.getDate() - 1);
      const tomorrow = new Date(anchorDate);
      tomorrow.setDate(anchorDate.getDate() + 1);
      dates.push(yesterday, new Date(anchorDate), tomorrow);
    }
    return dates;
  };

  const datesToRender = getDatesToRender();
  const dayCount = datesToRender.length;

  // Navigate calendar anchor date
  const handlePrev = () => {
    const newAnchor = new Date(anchorDate);
    newAnchor.setDate(anchorDate.getDate() - 1);
    setAnchorDate(newAnchor);
  };

  const handleNext = () => {
    const newAnchor = new Date(anchorDate);
    newAnchor.setDate(anchorDate.getDate() + 1);
    setAnchorDate(newAnchor);
  };

  const handleToday = () => {
    setAnchorDate(new Date());
    if (timeGridRef.current) {
      const now = new Date();
      const indicatorY = (now.getHours() + now.getMinutes() / 60) * HOUR_HEIGHT;
      const containerHeight = timeGridRef.current.clientHeight;
      const targetScrollTop = indicatorY - containerHeight / 2;
      const maxScrollTop = timeGridRef.current.scrollHeight - containerHeight;
      const boundedScrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop));
      
      timeGridRef.current.scrollTo({
        top: boundedScrollTop,
        behavior: 'smooth'
      });
    }
  };

  // Convert time string "HH:MM" to vertical pixel offset
  const timeToPixels = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return (hours + minutes / 60) * HOUR_HEIGHT; // HOUR_HEIGHT px per hour
  };

  // Convert vertical pixel offset to time string "HH:MM" (snapped to 15-min intervals)
  const pixelsToTime = (pixels: number): string => {
    const totalMinutes = Math.max(0, Math.min(1439, Math.round((pixels / HOUR_HEIGHT) * 4) * 15));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Drag and drop event handlers
  const handleCardMouseDown = (
    e: React.MouseEvent,
    card: EffortCard,
    type: 'move' | 'resize-bottom' | 'resize-top',
    dateIdx: number
  ) => {
    e.stopPropagation();
    e.preventDefault();

    hasDraggedRef.current = false;

    const initialTop = timeToPixels(card.startTime);
    const initialHeight = (card.durationMinutes / 60) * HOUR_HEIGHT;

    setActiveDrag({
      cardId: card.id,
      type,
      initialY: e.clientY,
      initialX: e.clientX,
      initialTop,
      initialHeight,
      initialDateIdx: dateIdx,
    });
  };

  // Manage global mouse events when dragging/resizing
  useEffect(() => {
    if (!activeDrag) return;

    const handleMouseMove = (e: MouseEvent) => {
      const card = effortCards.find((c) => c.id === activeDrag.cardId);
      if (!card) return;

      const deltaY = e.clientY - activeDrag.initialY;
      const deltaX = e.clientX - activeDrag.initialX;

      if (Math.abs(deltaY) > 3 || Math.abs(deltaX) > 3) {
        hasDraggedRef.current = true;
      }

      if (activeDrag.type === 'resize-bottom') {
        // Resize duration from bottom handle
        const newHeight = Math.max(40, activeDrag.initialHeight + deltaY); // min 10 min
        const durationMinutes = Math.round((newHeight / HOUR_HEIGHT) * 60);
        updateEffortCard(card.id, { durationMinutes });
      } else if (activeDrag.type === 'resize-top') {
        // Resize start time from top handle
        const newTop = Math.max(0, Math.min(24 * HOUR_HEIGHT - 40, activeDrag.initialTop + deltaY));
        const newHeight = Math.max(40, activeDrag.initialHeight - (newTop - activeDrag.initialTop));
        
        const startTime = pixelsToTime(newTop);
        const durationMinutes = Math.round((newHeight / HOUR_HEIGHT) * 60);

        updateEffortCard(card.id, { startTime, durationMinutes });
      } else if (activeDrag.type === 'move') {
        // Move card vertically (time) and horizontally (day column)
        const newTop = Math.max(0, Math.min(24 * HOUR_HEIGHT - activeDrag.initialHeight, activeDrag.initialTop + deltaY));
        const startTime = pixelsToTime(newTop);

        // Determine column drag delta
        if (timeGridRef.current) {
          const colWidth = (timeGridRef.current.clientWidth - 60) / dayCount;
          const colDelta = Math.round(deltaX / colWidth);
          const targetDateIdx = Math.max(0, Math.min(dayCount - 1, activeDrag.initialDateIdx + colDelta));
          const targetDateStr = formatDateString(datesToRender[targetDateIdx]);

          updateEffortCard(card.id, {
            startTime,
            date: targetDateStr,
          });
        }
      }
    };

    const handleMouseUp = () => {
      setActiveDrag(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeDrag, effortCards, dayCount, datesToRender]);

  // Double click on empty space in grid to create effort card
  const handleGridDoubleClick = (e: React.MouseEvent<HTMLDivElement>, date: Date) => {
    if (e.target !== e.currentTarget) return; // ignore double clicks on existing cards
    
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    
    // Snap to 15 mins
    const startTime = pixelsToTime(clickY);
    
    setDefaultDate(formatDateString(date));
    setDefaultTime(startTime);
    setSelectedCard(null);
    setIsDialogOpen(true);
  };

  // Quick action: start/stop stopwatch for active effort cards
  const toggleCardExecution = (card: EffortCard) => {
    if (card.status === 'draft') {
      const now = new Date();
      const currentHHMM = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      
      updateEffortCard(card.id, {
        status: 'active',
        date: formatDateString(now),
        startTime: currentHHMM,
      });
    } else if (card.status === 'active') {
      updateEffortCard(card.id, {
        status: 'completed',
      });
    }
  };

  return (
    <div className="calendar-panel" style={{ flex: 1 }}>
      {/* Calendar Header */}
      <div className="calendar-header">
        <div className="calendar-controls" style={{ width: '100%', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button className="btn-icon" onClick={handlePrev}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={handleToday}>
              Today
            </button>
            <button className="btn-icon" onClick={handleNext}>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="calendar-view-toggle">
            <button className={`toggle-btn ${viewType === 1 ? 'active' : ''}`} onClick={() => setViewType(1)}>1D</button>
            <button className={`toggle-btn ${viewType === 2 ? 'active' : ''}`} onClick={() => setViewType(2)}>2D</button>
            <button className={`toggle-btn ${viewType === 3 ? 'active' : ''}`} onClick={() => setViewType(3)}>3D</button>
          </div>
        </div>
      </div>

      {/* Day Headers */}
      <div className="calendar-day-headers">
        <div className="day-header-empty" />
        <div className="day-headers-grid" style={{ '--day-count': dayCount } as React.CSSProperties}>
          {datesToRender.map((date) => {
            const isToday = formatDateString(date) === formatDateString(new Date());
            return (
              <div key={date.getTime()} className={`day-header-cell ${isToday ? 'is-today' : ''}`}>
                <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  {getDayName(date)}
                </span>
                <span style={{ fontSize: '0.95rem', fontWeight: 700 }}>
                  {date.getDate()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Time Grid Layout */}
      <div className="calendar-grid-container">
        <div className="calendar-time-grid" ref={timeGridRef}>
          {/* Vertical axis labels */}
          <div className="time-axis">
            {Array.from({ length: 24 }).map((_, hour) => (
              <div key={hour} className="time-axis-label">
                {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
              </div>
            ))}
          </div>

          {/* Time columns */}
          <div className="columns-grid-container" style={{ '--day-count': dayCount } as React.CSSProperties}>
            {/* Current Time Indicator line across Today */}
            {datesToRender.map((date, idx) => {
              const isToday = formatDateString(date) === formatDateString(new Date());
              if (!isToday) return null;

              const indicatorY = (currentTime.getHours() + currentTime.getMinutes() / 60) * HOUR_HEIGHT;
              const colWidthPercent = 100 / dayCount;
              const leftOffset = idx * colWidthPercent;

              return (
                <div 
                  key="time-indicator" 
                  className="current-time-line" 
                  style={{ 
                    top: `${indicatorY}px`,
                    left: `${leftOffset}%`,
                    width: `${colWidthPercent}%`
                  }} 
                />
              );
            })}

            {/* Render Day Columns */}
            {datesToRender.map((date, dateIdx) => {
              const dateStr = formatDateString(date);
              const dayCards = effortCards.filter((card) => card.date === dateStr);

              return (
                <div 
                  key={dateStr} 
                  className="calendar-column"
                  onDoubleClick={(e) => handleGridDoubleClick(e, date)}
                >
                  {dayCards.map((card) => {
                    const top = timeToPixels(card.startTime);
                    const height = (card.durationMinutes / 60) * HOUR_HEIGHT;

                    return (
                      <div
                        key={card.id}
                        className={`effort-card-event ${card.status}`}
                        style={{
                          top: `${top}px`,
                          height: `${height}px`,
                          '--accent-color': card.color,
                          '--accent-color-glow': `${card.color}26` // glow transparency
                        } as React.CSSProperties}
                        onMouseDown={(e) => handleCardMouseDown(e, card, 'move', dateIdx)}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (hasDraggedRef.current) {
                            hasDraggedRef.current = false;
                            return;
                          }
                          setSelectedCard(card);
                          setIsDialogOpen(true);
                        }}
                      >
                        {/* Top resize handle */}
                        <div 
                          className="card-resize-handle card-resize-handle-top" 
                          onMouseDown={(e) => handleCardMouseDown(e, card, 'resize-top', dateIdx)}
                        />

                        {/* Event Content */}
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between', pointerEvents: 'none', overflow: 'hidden' }}>
                          <span className="card-title-text">{card.title}</span>
                          <span className="card-time-text">
                            <span>
                              {card.startTime} ({formatDuration(card.durationMinutes)})
                            </span>
                            {card.status === 'draft' && (
                              <button 
                                className="btn btn-primary btn-sm" 
                                style={{ pointerEvents: 'auto', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '4px' }}
                                onClick={(e) => { e.stopPropagation(); toggleCardExecution(card); }}
                              >
                                Commit
                              </button>
                            )}
                            {card.status === 'active' && (
                              <button 
                                className="btn btn-sm" 
                                style={{ 
                                  pointerEvents: 'auto', 
                                  backgroundColor: 'var(--accent-red)', 
                                  color: '#fff',
                                  fontSize: '0.65rem', 
                                  padding: '2px 6px', 
                                  borderRadius: '4px'
                                }}
                                onClick={(e) => { e.stopPropagation(); toggleCardExecution(card); }}
                              >
                                Stop
                              </button>
                            )}
                            {card.status === 'completed' && (
                              <span style={{ color: 'var(--accent-green)', fontWeight: 600, fontSize: '0.65rem' }}>
                                Done
                              </span>
                            )}
                          </span>
                        </div>

                        {/* Bottom resize handle */}
                        <div 
                          className="card-resize-handle card-resize-handle-bottom" 
                          onMouseDown={(e) => handleCardMouseDown(e, card, 'resize-bottom', dateIdx)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <EffortCardDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={(data) => {
          if (selectedCard) {
            updateEffortCard(selectedCard.id, data);
          } else {
            addEffortCard(data);
          }
        }}
        onDelete={selectedCard ? () => deleteEffortCard(selectedCard.id) : undefined}
        initialData={selectedCard}
        defaultDate={defaultDate}
        defaultTime={defaultTime}
      />
    </div>
  );
};
