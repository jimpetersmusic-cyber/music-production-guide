  const playNote = (frequency, duration = 200, instrument = 'bell') => {
    const audioContext = initAudioContext();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.value = frequency;
    
    // Different instrument types
    if (instrument === 'bell') {
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
    } else if (instrument === 'pad') {
      osc.type = 'sine';
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + duration / 1000);
    } else if (instrument === 'pluck') {
      osc.type = 'triangle';
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.05, now + duration / 1000);
    }
    
    osc.start(now);
    osc.stop(now + duration / 1000);
  };

  const stopAllNotes = () => {
    playingTimeoutIds.forEach(id => clearTimeout(id));
    setPlayingTimeoutIds([]);
    setIsPlayingNotes(false);
  };import React, { useState, useRef, useEffect } from 'react';
import { Plus, Trash2, ChevronRight, Music, Zap, Info, X, Mic, Play, Square, Download } from 'lucide-react';

export default function MusicProductionGuide() {
  const [projects, setProjects] = useState([]);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activePhase, setActivePhase] = useState(null);
  const [activeTab, setActiveTab] = useState('phases');
  const [selectedTipDetails, setSelectedTipDetails] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordings, setRecordings] = useState([]);
  const [recordedNotes, setRecordedNotes] = useState([]);
  const [savedKeyboardIdeas, setSavedKeyboardIdeas] = useState([]);
  const [isPlayingNotes, setIsPlayingNotes] = useState(false);
  const [octave, setOctave] = useState(4);
  const [dbReady, setDbReady] = useState(false);
  const [selectedInstrument, setSelectedInstrument] = useState('bell');
  const [playingTimeoutIds, setPlayingTimeoutIds] = useState([]);
  
  const mediaRecorderRef = useRef(null);
  const audioContextRef = useRef(null);
  const dbRef = useRef(null);

  // Initialize IndexedDB and load data
  useEffect(() => {
    const initDB = () => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open('MusicProductionDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          dbRef.current = request.result;
          resolve(request.result);
        };
        
        request.onupgradeneeded = (event) => {
          const db = event.target.result;
          if (!db.objectStoreNames.contains('projects')) {
            db.createObjectStore('projects', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('keyboardIdeas')) {
            db.createObjectStore('keyboardIdeas', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('recordings')) {
            db.createObjectStore('recordings', { keyPath: 'id' });
          }
        };
      });
    };

    const loadData = async () => {
      try {
        await initDB();
        const db = dbRef.current;
        
        // Load projects
        const projectsTx = db.transaction('projects', 'readonly');
        const projectsStore = projectsTx.objectStore('projects');
        const projectsRequest = projectsStore.getAll();
        
        projectsRequest.onsuccess = () => {
          setProjects(projectsRequest.result);
        };

        // Load keyboard ideas
        const ideasTx = db.transaction('keyboardIdeas', 'readonly');
        const ideasStore = ideasTx.objectStore('keyboardIdeas');
        const ideasRequest = ideasStore.getAll();
        
        ideasRequest.onsuccess = () => {
          setSavedKeyboardIdeas(ideasRequest.result);
        };

        // Load recordings
        const recordingsTx = db.transaction('recordings', 'readonly');
        const recordingsStore = recordingsTx.objectStore('recordings');
        const recordingsRequest = recordingsStore.getAll();
        
        recordingsRequest.onsuccess = () => {
          setRecordings(recordingsRequest.result);
        };

        setDbReady(true);
      } catch (error) {
        console.error('DB error:', error);
        setDbReady(true);
      }
    };

    loadData();
  }, []);

  // Save projects to IndexedDB
  useEffect(() => {
    if (!dbReady || !dbRef.current) return;
    
    const db = dbRef.current;
    const tx = db.transaction('projects', 'readwrite');
    const store = tx.objectStore('projects');
    
    store.clear();
    projects.forEach(project => {
      store.add(project);
    });
  }, [projects, dbReady]);

  // Save keyboard ideas to IndexedDB
  useEffect(() => {
    if (!dbReady || !dbRef.current) return;
    
    const db = dbRef.current;
    const tx = db.transaction('keyboardIdeas', 'readwrite');
    const store = tx.objectStore('keyboardIdeas');
    
    store.clear();
    savedKeyboardIdeas.forEach(idea => {
      store.add(idea);
    });
  }, [savedKeyboardIdeas, dbReady]);

  // Save recordings to IndexedDB
  useEffect(() => {
    if (!dbReady || !dbRef.current) return;
    
    const db = dbRef.current;
    const tx = db.transaction('recordings', 'readwrite');
    const store = tx.objectStore('recordings');
    
    store.clear();
    recordings.forEach(recording => {
      store.add(recording);
    });
  }, [recordings, dbReady]);

  const phases = [
    {
      id: 'idea',
      name: 'Initial Idea',
      description: 'Conceptualize and brainstorm your track',
      tips: [
        { text: 'Start with a mood or emotion', details: 'Define the emotional core of your track. Ask yourself: Is this dark? Uplifting? Melancholic? This guides all your decisions.' },
        { text: 'Listen to reference tracks', details: 'Find 2-3 professional tracks in your target genre. Study their structure and vibe.' },
        { text: 'Sketch out a rough BPM and key', details: 'House: 120-130 BPM, Techno: 120-150 BPM, Drum and bass: 160-180+ BPM.' },
        { text: 'Write down initial ideas', details: 'Capture inspiration before it disappears. Hum into your phone, sketch rhythms on paper.' },
        { text: 'Consider the narrative arc', details: 'Think about the journey: intro → development → climax → outro.' }
      ]
    },
    {
      id: 'development',
      name: 'Development',
      description: 'Develop your core musical elements',
      tips: [
        { text: 'Build a basic drum pattern', details: 'Create a 4 or 8-bar drum pattern with kick, snare, and hi-hat.' },
        { text: 'Create your main melodic hook', details: 'Write a memorable melodic phrase (4-8 bars) that defines your track.' },
        { text: 'Establish harmonic foundation', details: 'Define your chord progression that repeats throughout.' },
        { text: 'Experiment with textures and layers', details: 'Add pads, atmospheric textures, bass lines, or counter-melodies.' },
        { text: 'Record rough versions', details: 'Get everything into your DAW in basic form. Dont perfect anything yet.' }
      ]
    },
    {
      id: 'instruments',
      name: 'Instrument Choices',
      description: 'Select synths, samples, and sounds',
      tips: [
        { text: 'Decide between synth types', details: 'Digital synths: precise. Analog: warm. Samples: quick starting points.' },
        { text: 'Choose bass sounds', details: 'Deep house needs warm subs. Techno needs aggressive basses.' },
        { text: 'Select drum samples', details: 'Quality drums make a huge difference. Match punch and frequency to your genre.' },
        { text: 'Decide on vocal role', details: 'Lead (main melody), harmony (supporting), or texture (atmospheric).' },
        { text: 'Consider frequency balance', details: 'Kicks are low, snares mid-high, hi-hats high. Avoid frequency clashes.' }
      ]
    },
    {
      id: 'arrangement',
      name: 'Arrangement',
      description: 'Structure and organize your track',
      tips: [
        { text: 'Plan song structure', details: 'Sketch: 8-bar intro, 16-bar build, 16-bar drop, 16-bar break, etc.' },
        { text: 'Create transitions', details: 'Use filter sweeps, drum fills, drop-outs, or reverb builds.' },
        { text: 'Build tension and release', details: 'Gradually add elements, then release with a drop. Repeat to stay engaging.' },
        { text: 'Layer elements progressively', details: 'Start sparse: kick → hats → bass → synth → pad. Build momentum.' },
        { text: 'Consider vocal placement', details: 'Decide when vocals enter and how long phrases are.' }
      ]
    },
    {
      id: 'mixing',
      name: 'Mixing',
      description: 'Balance and polish all elements',
      tips: [
        { text: 'Start with rough levels', details: 'Set basic volume so all tracks are audible. Work around -20dB on master.' },
        { text: 'Pan instruments', details: 'Keep drums center. Pan hats slightly. Widen pads and ambient elements.' },
        { text: 'Use EQ to carve space', details: 'Use subtractive EQ. Reduce frequencies that compete.' },
        { text: 'Apply compression', details: 'Use 4:1 ratio on vocals, medium on bass, lighter on drums.' },
        { text: 'Add reverb and delay', details: 'Short reverb (1-2s) on drums, longer (2-4s) on pads.' }
      ]
    },
    {
      id: 'mastering',
      name: 'Mastering',
      description: 'Finalize and optimize for all platforms',
      tips: [
        { text: 'Use linear phase EQ', details: 'Maintains phase relationships. Use subtle cuts/boosts (1-3dB).' },
        { text: 'Apply multiband compression', details: 'Compress different frequencies independently with light settings.' },
        { text: 'Use limiter on master', details: 'Set threshold just below target loudness to prevent clipping.' },
        { text: 'Reference against pros', details: 'A/B switch between your track and professional reference.' },
        { text: 'Ensure consistent loudness', details: 'Aim for -14 LUFS for universal streaming compatibility.' }
      ]
    }
  ];

  const noteFrequencies = {
    'C': 261.63 * Math.pow(2, octave - 4),
    'C#': 277.18 * Math.pow(2, octave - 4),
    'D': 293.66 * Math.pow(2, octave - 4),
    'D#': 311.13 * Math.pow(2, octave - 4),
    'E': 329.63 * Math.pow(2, octave - 4),
    'F': 349.23 * Math.pow(2, octave - 4),
    'F#': 369.99 * Math.pow(2, octave - 4),
    'G': 392.00 * Math.pow(2, octave - 4),
    'G#': 415.30 * Math.pow(2, octave - 4),
    'A': 440 * Math.pow(2, octave - 4),
    'A#': 466.16 * Math.pow(2, octave - 4),
    'B': 493.88 * Math.pow(2, octave - 4),
  };

  const initAudioContext = () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioContextRef.current;
  };

  const playNote = (frequency, duration = 200) => {
    const audioContext = initAudioContext();
    const now = audioContext.currentTime;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(audioContext.destination);
    
    osc.frequency.value = frequency;
    osc.type = 'sine';
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + duration / 1000);
    
    osc.start(now);
    osc.stop(now + duration / 1000);
  };

  const handleKeyPress = (note) => {
    const freq = noteFrequencies[note];
    playNote(freq, 200, selectedInstrument);
    setRecordedNotes([...recordedNotes, { note, time: Date.now(), frequency: freq }]);
  };

  const playRecordedNotes = async () => {
    setIsPlayingNotes(true);
    if (recordedNotes.length > 0) {
      const startTime = recordedNotes[0].time;
      const timeoutIds = [];
      
      for (let i = 0; i < recordedNotes.length; i++) {
        const note = recordedNotes[i];
        const delay = note.time - startTime;
        const id = setTimeout(() => playNote(note.frequency, 200, selectedInstrument), delay);
        timeoutIds.push(id);
      }
      
      const totalDuration = recordedNotes[recordedNotes.length - 1].time - startTime + 200;
      const finalId = setTimeout(() => setIsPlayingNotes(false), totalDuration);
      timeoutIds.push(finalId);
      
      setPlayingTimeoutIds(timeoutIds);
    }
  };

  const saveKeyboardIdea = () => {
    if (recordedNotes.length > 0) {
      const idea = {
        id: Date.now(),
        notes: [...recordedNotes],
        date: new Date().toLocaleString(),
        name: `Idea ${savedKeyboardIdeas.length + 1}`
      };
      setSavedKeyboardIdeas([...savedKeyboardIdeas, idea]);
      setRecordedNotes([]);
    }
  };

  const playKeyboardIdea = (idea) => {
    setIsPlayingNotes(true);
    if (idea.notes.length > 0) {
      const startTime = idea.notes[0].time;
      const timeoutIds = [];
      
      for (let i = 0; i < idea.notes.length; i++) {
        const note = idea.notes[i];
        const delay = note.time - startTime;
        const id = setTimeout(() => playNote(note.frequency, 200, selectedInstrument), delay);
        timeoutIds.push(id);
      }
      
      const totalDuration = idea.notes[idea.notes.length - 1].time - startTime + 200;
      const finalId = setTimeout(() => setIsPlayingNotes(false), totalDuration);
      timeoutIds.push(finalId);
      
      setPlayingTimeoutIds(timeoutIds);
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const newRecording = { url, date: new Date().toLocaleString(), id: Date.now() };
        setRecordings(prev => [...prev, newRecording]);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      alert('Microphone error: ' + error.message);
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const downloadRecording = (url, index) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${index}.wav`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const createProject = () => {
    if (newProjectName.trim()) {
      const newProject = {
        id: Date.now(),
        name: newProjectName,
        createdAt: new Date().toLocaleDateString(),
        phaseData: {},
        additionalNotes: {}
      };
      setProjects([...projects, newProject]);
      setNewProjectName('');
      setShowNewProject(false);
      setActiveProjectId(newProject.id);
      setActiveTab('phases');
    }
  };

  const deleteProject = (id) => {
    setProjects(projects.filter(p => p.id !== id));
    if (activeProjectId === id) {
      setActiveProjectId(null);
      setActivePhase(null);
    }
  };

  const toggleTip = (projectId, phaseId, tipIndex) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const phaseData = p.phaseData[phaseId] || {};
        const checkedTips = phaseData.checkedTips || [];
        const isChecked = checkedTips.includes(tipIndex);
        return {
          ...p,
          phaseData: {
            ...p.phaseData,
            [phaseId]: {
              ...phaseData,
              checkedTips: isChecked ? checkedTips.filter(i => i !== tipIndex) : [...checkedTips, tipIndex]
            }
          }
        };
      }
      return p;
    }));
  };

  const updateTipNote = (projectId, phaseId, tipIndex, note) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        const phaseData = p.phaseData[phaseId] || {};
        const tipNotes = phaseData.tipNotes || {};
        return {
          ...p,
          phaseData: {
            ...p.phaseData,
            [phaseId]: { ...phaseData, tipNotes: { ...tipNotes, [tipIndex]: note } }
          }
        };
      }
      return p;
    }));
  };

  const updateAdditionalNotes = (projectId, phaseId, notes) => {
    setProjects(projects.map(p => {
      if (p.id === projectId) {
        return { ...p, additionalNotes: { ...p.additionalNotes, [phaseId]: notes } };
      }
      return p;
    }));
  };

  const currentProject = projects.find(p => p.id === activeProjectId);
  const currentPhase = phases.find(p => p.id === activePhase);
  const completedPhases = currentProject ? Object.keys(currentProject.phaseData).filter(key => {
    const phaseData = currentProject.phaseData[key];
    const phase = phases.find(p => p.id === key);
    return phaseData.checkedTips && phaseData.checkedTips.length === phase.tips.length;
  }).length : 0;
  const progressPercent = currentProject ? Math.round((completedPhases / phases.length) * 100) : 0;

  if (!dbReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <Music className="w-12 h-12 text-purple-400 mx-auto mb-4 animate-pulse" />
          <p className="text-slate-400">Loading your projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Music className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Electronic Music Production Guide
            </h1>
          </div>
          <p className="text-slate-400">Your step-by-step companion for creating electronic music</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-slate-800 rounded-lg p-4 border border-purple-500/20">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Projects</h2>
                <button onClick={() => setShowNewProject(true)} className="p-2 hover:bg-purple-500/20 rounded-lg transition">
                  <Plus className="w-5 h-5 text-purple-400" />
                </button>
              </div>

              {showNewProject && (
                <div className="mb-4 p-3 bg-slate-700 rounded-lg">
                  <input type="text" value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && createProject()} placeholder="Project name..." className="w-full bg-slate-600 text-white px-3 py-2 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-purple-400" autoFocus />
                  <div className="flex gap-2">
                    <button onClick={createProject} className="flex-1 bg-purple-600 hover:bg-purple-700 px-3 py-2 rounded transition text-sm">Create</button>
                    <button onClick={() => setShowNewProject(false)} className="flex-1 bg-slate-600 hover:bg-slate-700 px-3 py-2 rounded transition text-sm">Cancel</button>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {projects.length === 0 ? (
                  <p className="text-slate-500 text-sm">No projects yet. Create one!</p>
                ) : (
                  projects.map(project => (
                    <div key={project.id} className={`p-3 rounded-lg cursor-pointer transition border-l-4 ${activeProjectId === project.id ? 'bg-purple-600/30 border-purple-400' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}>
                      <div onClick={() => { setActiveProjectId(project.id); setActiveTab('phases'); }}>
                        <p className="font-medium text-sm">{project.name}</p>
                        <p className="text-xs text-slate-400 mt-1">{project.createdAt}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); deleteProject(project.id); }} className="mt-2 w-full p-1 text-red-400 hover:bg-red-500/20 rounded text-xs transition">
                        <Trash2 className="w-4 h-4 inline mr-1" /> Delete
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            {!activeProjectId ? (
              <div className="bg-slate-800/50 rounded-lg p-12 border border-purple-500/20 text-center">
                <Zap className="w-12 h-12 text-purple-400 mx-auto mb-4 opacity-50" />
                <h3 className="text-xl font-semibold mb-2">Create Your First Project</h3>
                <p className="text-slate-400">Start a new music production project</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setActiveTab('phases')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'phases' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Phases</button>
                  <button onClick={() => setActiveTab('ideas')} className={`px-4 py-2 rounded-lg transition ${activeTab === 'ideas' ? 'bg-purple-600' : 'bg-slate-700 hover:bg-slate-600'}`}>Ideas Lab</button>
                </div>

                {activeTab === 'phases' && !activePhase && (
                  <div className="space-y-4">
                    <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/20">
                      <h2 className="text-2xl font-bold mb-2">{currentProject.name}</h2>
                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex-1">
                          <div className="bg-slate-600 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all" style={{ width: `${progressPercent}%` }} />
                          </div>
                        </div>
                        <span className="text-sm font-medium text-purple-400">{progressPercent}%</span>
                      </div>
                      <p className="text-slate-400 text-sm">{completedPhases} of {phases.length} phases completed</p>
                    </div>

                    <div className="grid gap-3">
                      {phases.map(phase => {
                        const hasWork = currentProject.phaseData[phase.id]?.checkedTips?.length > 0;
                        return (
                          <button key={phase.id} onClick={() => setActivePhase(phase.id)} className={`p-4 rounded-lg text-left transition border-l-4 ${hasWork ? 'bg-slate-700 border-green-500/50' : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="font-semibold flex items-center gap-2">{hasWork && <span className="text-green-400">✓</span>}{phase.name}</h3>
                                <p className="text-sm text-slate-400 mt-1">{phase.description}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-slate-500" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'phases' && activePhase && (
                  <div className="space-y-4">
                    <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/20">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-3xl font-bold">{currentPhase.name}</h2>
                        <button onClick={() => setActivePhase(null)} className="text-purple-400 hover:text-purple-300 text-sm font-semibold">← Back</button>
                      </div>
                      <p className="text-slate-400 mb-6">{currentPhase.description}</p>

                      {(activePhase === 'idea' || activePhase === 'development') && (
                        <div className="mb-6 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
                          <button onClick={() => setActiveTab('ideas')} className="text-purple-300 hover:text-purple-200 text-sm font-semibold">💡 Open Ideas Lab to capture melodies</button>
                        </div>
                      )}

                      <div className="mb-8">
                        <h3 className="text-lg font-semibold mb-4 text-purple-300">Tips & Guidelines</h3>
                        <div className="space-y-4">
                          {currentPhase.tips.map((tip, idx) => {
                            const isChecked = currentProject.phaseData[currentPhase.id]?.checkedTips?.includes(idx);
                            const tipNote = currentProject.phaseData[currentPhase.id]?.tipNotes?.[idx] || '';
                            return (
                              <div key={idx} className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
                                <div className="flex items-start gap-3 mb-3">
                                  <input type="checkbox" checked={isChecked} onChange={() => toggleTip(activeProjectId, currentPhase.id, idx)} className="mt-1 w-5 h-5 cursor-pointer accent-purple-400" />
                                  <span className={`text-sm flex-1 ${isChecked ? 'line-through text-slate-500' : 'text-slate-300'}`}>{tip.text}</span>
                                  <button onClick={() => setSelectedTipDetails(tip)} className="p-1 hover:bg-purple-500/30 rounded transition flex-shrink-0">
                                    <Info className="w-4 h-4 text-purple-400" />
                                  </button>
                                </div>
                                <textarea value={tipNote} onChange={(e) => updateTipNote(activeProjectId, currentPhase.id, idx, e.target.value)} placeholder="Add notes..." className="w-full bg-slate-600 text-white px-3 py-2 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-400" style={{ minHeight: '64px', resize: 'none' }} />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="border-t border-slate-700 pt-6">
                        <h3 className="text-lg font-semibold mb-3 text-purple-300">Additional Notes</h3>
                        <textarea value={currentProject.additionalNotes[currentPhase.id] || ''} onChange={(e) => updateAdditionalNotes(activeProjectId, currentPhase.id, e.target.value)} placeholder="Your additional thoughts..." className="w-full bg-slate-700 text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none h-32" />
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'ideas' && (
                  <div className="space-y-6">
                    <div className="bg-slate-800 rounded-lg p-6 border border-purple-500/20">
                      <h2 className="text-3xl font-bold mb-6">Ideas Lab</h2>

                      <div className="space-y-6">
                        <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                          <h3 className="text-xl font-semibold mb-4 text-purple-300">Virtual Keyboard</h3>
                          <div className="mb-4 flex items-center gap-4">
                            <span className="text-sm">Octave:</span>
                            <button onClick={() => setOctave(Math.max(1, octave - 1))} className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm">−</button>
                            <span className="text-lg font-bold w-8 text-center">{octave}</span>
                            <button onClick={() => setOctave(Math.min(7, octave + 1))} className="bg-slate-600 hover:bg-slate-500 px-3 py-1 rounded text-sm">+</button>
                          </div>
                          <div className="mb-4">
                            <p className="text-sm text-slate-300 mb-2">Instrument:</p>
                            <div className="flex gap-2">
                              {['bell', 'pad', 'pluck'].map(inst => (
                                <button
                                  key={inst}
                                  onClick={() => setSelectedInstrument(inst)}
                                  className={`px-3 py-1 rounded text-sm capitalize transition ${selectedInstrument === inst ? 'bg-purple-600' : 'bg-slate-600 hover:bg-slate-500'}`}
                                >
                                  {inst}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div className="relative mb-6">
                            <div className="flex gap-1 mb-2 h-24">
                              {['C', 'D', 'E', 'F', 'G', 'A', 'B'].map(note => (
                                <div key={note} className="relative flex-1">
                                  <button onClick={() => handleKeyPress(note)} className="w-full h-24 bg-white hover:bg-gray-200 active:bg-gray-300 text-black font-bold rounded-b-lg border border-gray-300 transition">
                                    {note}
                                  </button>
                                  {['C', 'D', 'F', 'G', 'A'].includes(note) && (
                                    <button onClick={() => handleKeyPress(note + '#')} className="absolute right-0 top-0 w-2/3 h-16 bg-black hover:bg-gray-800 active:bg-gray-900 text-white font-bold rounded-b-md border border-black transition z-10 text-xs">
                                      {note}#
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="flex gap-2 mb-4">
                            <button onClick={playRecordedNotes} disabled={recordedNotes.length === 0 || isPlayingNotes} className="flex-1 bg-green-600 hover:bg-green-500 disabled:bg-slate-600 px-4 py-2 rounded flex items-center justify-center gap-2">
                              <Play className="w-4 h-4" /> Play
                            </button>
                            <button onClick={stopAllNotes} disabled={!isPlayingNotes} className="flex-1 bg-orange-600 hover:bg-orange-500 disabled:bg-slate-600 px-4 py-2 rounded flex items-center justify-center gap-2">
                              <Square className="w-4 h-4" /> Stop
                            </button>
                            <button onClick={saveKeyboardIdea} disabled={recordedNotes.length === 0} className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 px-4 py-2 rounded flex items-center justify-center gap-2">
                              💾 Save Idea
                            </button>
                            <button onClick={() => setRecordedNotes([])} disabled={recordedNotes.length === 0} className="flex-1 bg-red-600 hover:bg-red-500 disabled:bg-slate-600 px-4 py-2 rounded">
                              Clear
                            </button>
                          </div>
                          <p className="text-xs text-slate-400">Current: {recordedNotes.length} notes</p>

                          {savedKeyboardIdeas.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-600">
                              <p className="text-sm font-semibold text-purple-300 mb-3">Saved Keyboard Ideas:</p>
                              <div className="space-y-2">
                                {savedKeyboardIdeas.map((idea) => (
                                  <div key={idea.id} className="flex items-center justify-between bg-slate-600 p-3 rounded-lg">
                                    <div>
                                      <p className="text-sm font-medium">{idea.name}</p>
                                      <p className="text-xs text-slate-400">{idea.notes.length} notes • {idea.date}</p>
                                    </div>
                                    <div className="flex gap-2">
                                      <button onClick={() => playKeyboardIdea(idea)} className="bg-green-600 hover:bg-green-500 px-3 py-1 rounded text-sm">
                                        <Play className="w-4 h-4" />
                                      </button>
                                      <button onClick={stopAllNotes} className="bg-orange-600 hover:bg-orange-500 px-3 py-1 rounded text-sm">
                                        <Square className="w-4 h-4" />
                                      </button>
                                      <button onClick={() => setSavedKeyboardIdeas(savedKeyboardIdeas.filter(i => i.id !== idea.id))} className="bg-red-600 hover:bg-red-500 px-3 py-1 rounded text-sm">
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="bg-slate-700/50 p-6 rounded-lg border border-slate-600">
                          <h3 className="text-xl font-semibold mb-4 text-purple-300">Audio Recorder</h3>
                          <div className="mb-4">
                            {isRecording ? (
                              <button onClick={stopAudioRecording} className="w-full bg-red-600 hover:bg-red-500 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold">
                                <Square className="w-5 h-5" /> Stop Recording
                              </button>
                            ) : (
                              <button onClick={startAudioRecording} className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-lg flex items-center justify-center gap-2 font-semibold">
                                <Mic className="w-5 h-5" /> Start Recording
                              </button>
                            )}
                          </div>
                          {isRecording && <p className="text-red-400 text-sm text-center animate-pulse">● Recording in progress...</p>}

                          {recordings && recordings.length > 0 && (
                            <div className="mt-6 pt-6 border-t border-slate-600 space-y-3">
                              <p className="text-sm font-semibold text-purple-300">Audio Recordings ({recordings.length}):</p>
                              {recordings.map((recording, idx) => (
                                <div key={recording.id} className="bg-slate-700 p-3 rounded-lg">
                                  <p className="text-sm font-medium mb-2">Recording {idx + 1}</p>
                                  <p className="text-xs text-slate-400 mb-2">{recording.date}</p>
                                  <div className="flex gap-2 flex-wrap">
                                    <audio controls src={recording.url} className="flex-1 min-h-8" />
                                    <button onClick={() => downloadRecording(recording.url, idx)} className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded text-sm flex items-center gap-1">
                                      <Download className="w-4 h-4" /> Download
                                    </button>
                                    <button onClick={() => setRecordings(recordings.filter(r => r.id !== recording.id))} className="bg-red-600 hover:bg-red-500 px-3 py-2 rounded text-sm">
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedTipDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-lg border border-purple-500/30 max-w-2xl max-h-screen overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-purple-500/20 p-6 flex items-start justify-between">
              <h2 className="text-2xl font-bold text-purple-300">{selectedTipDetails.text}</h2>
              <button onClick={() => setSelectedTipDetails(null)} className="p-1 hover:bg-slate-700 rounded transition">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            <div className="p-6 text-slate-300">
              <p>{selectedTipDetails.details}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
