import React, { useState, useEffect } from 'react';
import {
  Users,
  Sparkles,
  MessageCircle,
  Bot,
  Video,
  Clock,
  Send,
  Heart,
  Calendar,
  CheckCircle,
  Hash,
  Shield,
  Coffee,
  Bookmark,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

export function PeerCircles({ userProfile }) {
  const [circles, setCircles] = useState([]);
  const [activeCircleId, setActiveCircleId] = useState('circle_robotics');
  const [loading, setLoading] = useState(true);
  
  // Interactive Buddy Chat simulation
  const [chatMessages, setChatMessages] = useState([
    {
      sender: "Julian M. (Peer Mentor)",
      role: "mentor",
      text: "Hey Alex! Welcome to the Robotics & Creative Coding circle. We love having folks who build sensor projects. What microcontroller are you working with lately?",
      time: "10:14 AM"
    }
  ]);
  const [replyText, setReplyText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [joinedCircles, setJoinedCircles] = useState(new Set(['circle_robotics']));

  useEffect(() => {
    fetch('/api/social-connect/circles')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.circles) {
          setCircles(data.circles);
        }
      })
      .catch(err => console.error('Failed to load peer circles:', err))
      .finally(() => setLoading(false));
  }, []);

  const activeCircle = circles.find(c => c.id === activeCircleId) || circles[0];

  const handleSelectCircle = (circleId) => {
    setActiveCircleId(circleId);
    const circle = circles.find(c => c.id === circleId);
    if (circle) {
      setChatMessages([
        {
          sender: circle.activeBuddies[0]?.name || "Peer Buddy",
          role: "peer",
          text: `Hi Alex! Welcome to ${circle.name}! ${circle.starterTopic}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  const handleJoinCircle = (circleId) => {
    setJoinedCircles(prev => {
      const next = new Set(prev);
      if (next.has(circleId)) next.delete(circleId);
      else next.add(circleId);
      return next;
    });
  };

  const handleSendChat = (e) => {
    e?.preventDefault();
    if (!replyText.trim() || isTyping) return;

    const userMsg = {
      sender: userProfile?.name || "Alex Rivera",
      role: "wearer",
      text: replyText.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    const sentText = replyText;
    setReplyText('');
    setIsTyping(true);

    setTimeout(() => {
      let buddyReply = "That's awesome! I had the exact same question when I started. Let me link the schematic we used in our last session!";
      const lower = sentText.toLowerCase();

      if (lower.includes('raspberry') || lower.includes('python') || lower.includes('code')) {
        buddyReply = "Yes! Python is great for sensor polling. I wrote a small script that logs IMU coordinates to a local JSON file — would love to trade notes!";
      } else if (lower.includes('minecraft') || lower.includes('redstone') || lower.includes('build')) {
        buddyReply = "Our server has a creative plot ready for you whenever you want to test out your redstone build without mobs interrupting!";
      } else if (lower.includes('art') || lower.includes('procreate') || lower.includes('draw')) {
        buddyReply = "Parallel drawing sessions happen every Sunday at 4pm! Everyone just listens to lofi beats and draws on mute. You're super welcome to drop in!";
      }

      setChatMessages(prev => [
        ...prev,
        {
          sender: activeCircle?.activeBuddies[0]?.name || "Julian M.",
          role: "peer",
          text: buddyReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-purple-500/30 bg-gradient-to-br from-purple-950/40 via-slate-900/80 to-indigo-950/40 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs font-bold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Inclusive Peer Circles & Community Connect</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real Friendship & Connection Around Shared Passions
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Autistic youth who are homeschooled or in separate special schools often lack natural peer groups. <strong className="text-white">Peer Circles</strong> connects you with inclusive, neuro-affirming study buddies and hobby circles. No small talk pressure — connect authentically through shared interests, parallel co-working, and collaborative projects.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shrink-0">
            <Shield className="w-8 h-8 text-emerald-400" />
            <div>
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Safe & Sensory-Friendly
              </div>
              <p className="text-[11px] text-slate-400">
                Text-first • Camera optional • Anti-bullying charter
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Circle Directory & Live Peer Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 5 Cols: Circle Cards */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Inclusive Interest Circles
            </h3>
            <span className="text-[11px] text-purple-400 font-semibold">
              {circles.length} Verified Circles
            </span>
          </div>

          <div className="space-y-2.5">
            {circles.map((circle) => {
              const isActive = circle.id === activeCircleId;
              const isJoined = joinedCircles.has(circle.id);

              return (
                <div
                  key={circle.id}
                  onClick={() => handleSelectCircle(circle.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-950/70 via-indigo-950/60 to-slate-900 border-purple-400 shadow-xl shadow-purple-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                        {circle.icon}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-bold text-white">
                            {circle.name}
                          </h4>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-purple-300 border border-slate-700 font-medium">
                          {circle.focus}
                        </span>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                          {circle.description}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinCircle(circle.id);
                      }}
                      className={`text-xs px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                        isJoined
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                          : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                      }`}
                    >
                      {isJoined ? 'Joined ✓' : 'Join'}
                    </button>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      {circle.frequency}
                    </span>
                    <span className="flex items-center gap-1 font-mono text-purple-300">
                      <Users className="w-3 h-3" />
                      {circle.membersCount} members
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 7 Cols: Active Circle Space & Peer Buddy Exchange */}
        <div className="lg:col-span-7 space-y-4">
          
          {activeCircle && (
            <div className="glass-panel p-5 rounded-2xl border border-purple-500/30 bg-slate-900/90 shadow-xl">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{activeCircle.icon}</span>
                    <h3 className="text-lg font-bold text-white">
                      {activeCircle.name}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Meeting Format: <strong className="text-slate-200">{activeCircle.meetingType}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    2 Buddies Online
                  </span>
                </div>
              </div>

              {/* Active Online Buddies Chips */}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-slate-400">Active Peer Buddies:</span>
                {activeCircle.activeBuddies?.map((buddy, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 text-xs text-slate-200 border border-slate-700"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <strong>{buddy.name}</strong>
                    <span className="text-[10px] text-slate-400">({buddy.interest})</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Peer Chat Stream */}
          <div className="glass-panel p-5 rounded-3xl border border-slate-800 bg-slate-950/80 min-h-[350px] max-h-[420px] overflow-y-auto flex flex-col space-y-3.5 shadow-inner">
            {chatMessages.map((msg, i) => {
              const isUser = msg.role === 'wearer';
              return (
                <div
                  key={i}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 mb-1 px-1">
                    <span className={`text-[10px] font-bold ${isUser ? 'text-indigo-400' : 'text-purple-400'}`}>
                      {msg.sender}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {msg.time}
                    </span>
                  </div>
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-tr-sm'
                        : 'bg-slate-900 border border-slate-700/80 text-white rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-slate-400 p-2 italic animate-pulse">
                <Sparkles className="w-3 h-3 text-purple-400" />
                <span>Peer buddy is replying...</span>
              </div>
            )}
          </div>

          {/* Quick Icebreaker Chip Prompts */}
          <div className="space-y-1.5">
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              ⚡ Quick Icebreaker Prompts (One-Click Send)
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                "Hi! I'm Alex. Excited to connect with this group.",
                `I love working on ${userProfile?.specialInterests?.[0] || 'Python & Robotics'}!`,
                "What project is everyone working on right now?",
                "Do you prefer asynchronous text chat or parallel co-working?"
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setReplyText(prompt);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-purple-950/60 border border-slate-700 hover:border-purple-400 text-xs text-slate-300 transition text-left cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendChat} className="flex items-center gap-2">
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Message ${activeCircle?.name || 'circle'}...`}
              className="flex-1 bg-slate-900 border border-slate-700 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 transition"
            />
            <button
              type="submit"
              disabled={!replyText.trim() || isTyping}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 transition disabled:opacity-50 cursor-pointer shadow-lg shadow-purple-500/20"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>

      </div>

    </div>
  );
}
