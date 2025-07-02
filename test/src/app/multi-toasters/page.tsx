'use client';

import React from 'react';
import { Toaster, toast, createToaster } from 'sonner';

// Create different toaster instances for different purposes
const systemToast = createToaster('system');
const chatToast = createToaster('chat');
const analyticsToast = createToaster('analytics');

export default function MultiToastersPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light');

  // Simulate different types of notifications
  const simulateSystemNotification = () => {
    systemToast('System update available', {
      description: 'Version 2.0.1 is ready to install',
      duration: Infinity,
      className: 'red',
    });
  };

  const simulateChatMessage = () => {
    const messages = [
      { from: 'Alice', text: 'Hey, how are you?' },
      { from: 'Bob', text: 'Did you see the latest update?' },
      { from: 'Charlie', text: 'Meeting in 5 minutes!' },
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    chatToast(`New message from ${randomMessage.from}`, {
      description: randomMessage.text,
      duration: 4000,
    });
  };

  const simulateAnalyticsEvent = () => {
    const events = [
      { type: 'success', message: 'Daily goal achieved!', value: '1,234 visitors' },
      { type: 'warning', message: 'High bounce rate detected', value: '65% on homepage' },
      { type: 'info', message: 'New traffic source', value: 'Reddit referrals +45%' },
    ];
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    analyticsToast[randomEvent.type as 'success' | 'warning' | 'info'](randomEvent.message, {
      description: randomEvent.value,
      duration: 6000,
    });
  };

  const testAllToasters = () => {
    // Fire notifications with delays to see them stack
    simulateSystemNotification();
    setTimeout(simulateChatMessage, 500);
    setTimeout(simulateAnalyticsEvent, 1000);

    // Also show a default toast
    setTimeout(() => {
      toast('This is a default toast', {
        description: 'It appears in the default toaster',
      });
    }, 1500);
  };

  return (
    <div style={{ padding: '40px', minHeight: '100vh', backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f5f5f5' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ color: theme === 'dark' ? '#fff' : '#000', marginBottom: '20px' }}>Multi-Toaster Demo</h1>

        <p style={{ color: theme === 'dark' ? '#ccc' : '#666', marginBottom: '40px' }}>
          This page demonstrates multiple independent toaster instances for different notification types.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            style={{
              padding: '10px 20px',
              backgroundColor: theme === 'dark' ? '#333' : '#fff',
              color: theme === 'dark' ? '#fff' : '#000',
              border: '1px solid',
              borderColor: theme === 'dark' ? '#555' : '#ccc',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Toggle Theme
          </button>

          <button
            onClick={simulateSystemNotification}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0066cc',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            System Notification
          </button>

          <button
            onClick={simulateChatMessage}
            style={{
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Chat Message
          </button>

          <button
            onClick={simulateAnalyticsEvent}
            style={{
              padding: '10px 20px',
              backgroundColor: '#8b5cf6',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Analytics Event
          </button>

          <button
            onClick={testAllToasters}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f59e0b',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Test All Toasters
          </button>

          <button
            onClick={() => toast('Default toast')}
            style={{
              padding: '10px 20px',
              backgroundColor: theme === 'dark' ? '#444' : '#e5e5e5',
              color: theme === 'dark' ? '#fff' : '#000',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Default Toast
          </button>
        </div>

        <div
          style={{
            backgroundColor: theme === 'dark' ? '#2a2a2a' : '#fff',
            padding: '20px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          }}
        >
          <h2 style={{ color: theme === 'dark' ? '#fff' : '#000', marginBottom: '10px' }}>
            Multiple Toaster Instances
          </h2>
          <p style={{ color: theme === 'dark' ? '#ccc' : '#666', marginBottom: '10px' }}>
            Each column below represents an independent toaster instance with its own key:
          </p>
          <ul style={{ color: theme === 'dark' ? '#ccc' : '#666' }}>
            <li>
              <strong>System Notifications:</strong> Blue theme (key: "system")
            </li>
            <li>
              <strong>Chat Messages:</strong> Green theme (key: "chat")
            </li>
            <li>
              <strong>Analytics Events:</strong> Purple theme (key: "analytics")
            </li>
            <li>
              <strong>General Notifications:</strong> Gray theme (default toaster)
            </li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <a href="/" style={{ color: '#0066cc' }}>
            ← Back to main demo
          </a>
        </div>
      </div>

      {/* Toasters Container - All in a row */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          marginTop: '40px',
          padding: '20px',
          backgroundColor: theme === 'dark' ? '#262626' : '#fafafa',
          borderRadius: '12px',
          border: `1px solid ${theme === 'dark' ? '#404040' : '#e5e5e5'}`,
        }}
      >
        {/* System Notifications Toaster */}
        <div
          style={{
            flex: 1,
            minHeight: '400px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #0066cc',
            position: 'relative',
          }}
        >
          <h3
            style={{
              color: '#0066cc',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            System Notifications
          </h3>
          <Toaster
            toasterKey="system"
            theme={theme}
            toastOptions={{
              style: {
                borderLeft: '4px solid #0066cc',
                backgroundColor: theme === 'dark' ? '#1e293b' : '#e0f2fe',
              },
            }}
            containerAriaLabel="System Notifications"
            richColors
            closeButton
          />
        </div>

        {/* Chat Messages Toaster */}
        <div
          style={{
            flex: 1,
            minHeight: '400px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #10b981',
            position: 'relative',
          }}
        >
          <h3
            style={{
              color: '#10b981',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Chat Messages
          </h3>
          <Toaster
            toasterKey="chat"
            theme={theme}
            toastOptions={{
              style: {
                borderLeft: '4px solid #10b981',
                backgroundColor: theme === 'dark' ? '#064e3b' : '#d1fae5',
              },
            }}
            containerAriaLabel="Chat Messages"
            expand
            visibleToasts={4}
          />
        </div>

        {/* Analytics Events Toaster */}
        <div
          style={{
            flex: 1,
            minHeight: '400px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #8b5cf6',
            position: 'relative',
          }}
        >
          <h3
            style={{
              color: '#8b5cf6',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            Analytics Events
          </h3>
          <Toaster
            toasterKey="analytics"
            theme={theme}
            toastOptions={{
              style: {
                borderLeft: '4px solid #8b5cf6',
                backgroundColor: theme === 'dark' ? '#4c1d95' : '#ede9fe',
              },
            }}
            containerAriaLabel="Analytics Events"
            richColors
            duration={6000}
          />
        </div>

        {/* Default Toaster */}
        <div
          style={{
            flex: 1,
            minHeight: '400px',
            backgroundColor: theme === 'dark' ? '#1a1a1a' : '#fff',
            borderRadius: '8px',
            padding: '16px',
            border: '2px solid #6b7280',
            position: 'relative',
          }}
        >
          <h3
            style={{
              color: '#6b7280',
              marginBottom: '10px',
              fontSize: '14px',
              fontWeight: 'bold',
            }}
          >
            General Notifications
          </h3>
          <Toaster theme={theme} containerAriaLabel="General Notifications" />
        </div>
      </div>
    </div>
  );
}
