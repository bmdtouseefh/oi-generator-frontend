import React, { useState } from 'react';
import { Download, Loader2, Wand2 } from 'lucide-react';

// Configuration for image parameters
const IMAGE_PARAMETERS = [
  {
    id: 'tone',
    label: 'Tone of Image',
    options: [
      { value: 'realistic', label: 'Realistic' },
      { value: 'artistic', label: 'Artistic' },
      { value: 'cartoon', label: 'Cartoon' },
      { value: 'abstract', label: 'Abstract' },
      { value: 'vintage', label: 'Vintage' }
    ]
  },
  {
    id: 'style',
    label: 'Art Style',
    options: [
      { value: 'photographic', label: 'Photographic' },
      { value: 'painting', label: 'Digital Painting' },
      { value: 'sketch', label: 'Pencil Sketch' },
      { value: 'watercolor', label: 'Watercolor' },
      { value: 'oil', label: 'Oil Painting' }
    ]
  },
  {
    id: 'mood',
    label: 'Mood',
    options: [
      { value: 'bright', label: 'Bright & Cheerful' },
      { value: 'dark', label: 'Dark & Moody' },
      { value: 'calm', label: 'Calm & Peaceful' },
      { value: 'energetic', label: 'Energetic & Dynamic' },
      { value: 'mysterious', label: 'Mysterious' }
    ]
  },
  {
    id: 'quality',
    label: 'Quality',
    options: [
      { value: 'standard', label: 'Standard' },
      { value: 'high', label: 'High Quality' },
      { value: 'ultra', label: 'Ultra High' },
      { value: '4k', label: '4K Resolution' },
      { value: '8k', label: '8K Resolution' }
    ]
  }
];

// API functions using fetch
const optimizePrompt = async (rawPrompt, parameters) => {
  try {
    const response = await fetch('http://localhost:8000/optimize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: rawPrompt,
        parameters: parameters
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.optimizedPrompts || [];
  } catch (error) {
    console.error('Error optimizing prompt:', error);
    throw error;
  }
};

const generateImage = async (optimizedPrompt) => {
  try {
    const response = await fetch('http://localhost:8000/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: optimizedPrompt
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl || '';
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
};

// Components
const InputSection = ({ rawPrompt, setRawPrompt, parameters, setParameters, onOptimize, isOptimizing }) => (
  <div className="bg-white rounded-lg shadow-md p-6 space-y-6">
    <h2 className="text-2xl font-bold text-gray-800 text-center">Image Generator with Prompt Optimization</h2>
    
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Enter the prompt to optimize
      </label>
      <textarea
        value={rawPrompt}
        onChange={(e) => setRawPrompt(e.target.value)}
        placeholder="Describe the image you want to generate..."
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        rows={4}
      />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {IMAGE_PARAMETERS.map((param) => (
        <div key={param.id}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {param.label}
          </label>
          <select
            value={parameters[param.id] || ''}
            onChange={(e) => setParameters(prev => ({ ...prev, [param.id]: e.target.value }))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select {param.label}</option>
            {param.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>

    <button
      onClick={onOptimize}
      disabled={!rawPrompt.trim() || isOptimizing}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
    >
      {isOptimizing ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" />
          Optimizing Prompts...
        </>
      ) : (
        <>
          <Wand2 className="w-5 h-5" />
          Optimize Prompts
        </>
      )}
    </button>
  </div>
);

const OptimizedPromptsSection = ({ prompts, onEdit, onSubmit, isGenerating }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {prompts.map((prompt, index) => (
      <div key={index} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Editable Optimized Prompt {index + 1}
        </h3>
        <textarea
          value={prompt}
          onChange={(e) => onEdit(index, e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none mb-4"
          rows={6}
        />
        <button
          onClick={() => onSubmit(prompt)}
          disabled={isGenerating}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Select and Submit this Prompt'
          )}
        </button>
      </div>
    ))}
  </div>
);

const GeneratedImageSection = ({ imageUrl, onSave, onViewInNewTab }) => (
  <div className="bg-white rounded-lg shadow-md p-6">
    <div className="bg-gray-100 rounded-lg p-8 mb-6 flex items-center justify-center min-h-96">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Generated"
          className="max-w-full max-h-96 rounded-lg shadow-lg"
        />
      ) : (
        <div className="text-gray-500 text-center">
          <p className="text-lg font-medium">Generated Image will appear here</p>
          <p className="text-sm mt-2">Submit an optimized prompt to generate an image</p>
        </div>
      )}
    </div>

    {imageUrl && (
      <div className="flex gap-4 justify-center">
        <button
          onClick={onViewInNewTab}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
        >
          View in New Tab
        </button>
        <button
          onClick={onSave}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          Save
        </button>
      </div>
    )}
  </div>
);

// Main App Component
export default function ImageGeneratorApp() {
  const [rawPrompt, setRawPrompt] = useState('');
  const [parameters, setParameters] = useState({});
  const [optimizedPrompts, setOptimizedPrompts] = useState([]);
  const [generatedImageUrl, setGeneratedImageUrl] = useState('');
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleOptimizePrompts = async () => {
    if (!rawPrompt.trim()) return;

    setIsOptimizing(true);
    try {
      const prompts = await optimizePrompt(rawPrompt, parameters);
      setOptimizedPrompts(prompts);
    } catch (error) {
      console.error('Error optimizing prompts:', error);
      alert('Failed to optimize prompts. Please try again.');
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleEditPrompt = (index, newPrompt) => {
    setOptimizedPrompts(prev => 
      prev.map((prompt, i) => i === index ? newPrompt : prompt)
    );
  };

  const handleSubmitPrompt = async (selectedPrompt) => {
    if (!selectedPrompt.trim()) return;

    setIsGenerating(true);
    try {
      const imageUrl = await generateImage(selectedPrompt);
      setGeneratedImageUrl(imageUrl);
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Failed to generate image. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveImage = async () => {
    if (!generatedImageUrl) return;
    
    try {
      const response = await fetch(generatedImageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `generated-image-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error saving image:', error);
      alert('Failed to save image. Please try again.');
    }
  };

  const handleViewInNewTab = () => {
    if (!generatedImageUrl) return;
    window.open(generatedImageUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-purple-500 to-purple-600 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <InputSection
          rawPrompt={rawPrompt}
          setRawPrompt={setRawPrompt}
          parameters={parameters}
          setParameters={setParameters}
          onOptimize={handleOptimizePrompts}
          isOptimizing={isOptimizing}
        />

        {optimizedPrompts.length > 0 && (
          <OptimizedPromptsSection
            prompts={optimizedPrompts}
            onEdit={handleEditPrompt}
            onSubmit={handleSubmitPrompt}
            isGenerating={isGenerating}
          />
        )}

        <GeneratedImageSection
          imageUrl={generatedImageUrl}
          onSave={handleSaveImage}
          onViewInNewTab={handleViewInNewTab}
        />
      </div>
    </div>
  );
}