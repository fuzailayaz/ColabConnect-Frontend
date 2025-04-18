'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronRight, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OnboardingGuideProps {
  onDismiss: () => void;
}

const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ onDismiss }) => {
  const [step, setStep] = useState(0);
  
  const steps = [
    {
      title: "Welcome to CollabConnect!",
      description: "Let's take a quick tour to help you get started.",
      image: "/images/onboarding/welcome.svg" // You'll need to add these images
    },
    {
      title: "Discover Projects",
      description: "Find exciting projects that match your skills and interests.",
      image: "/images/onboarding/projects.svg"
    },
    {
      title: "Connect with Collaborators",
      description: "Build your network with like-minded professionals.",
      image: "/images/onboarding/connect.svg"
    },
    {
      title: "AI-Powered Insights",
      description: "Get personalized recommendations and insights to boost your collaboration.",
      image: "/images/onboarding/ai.svg"
    }
  ];
  
  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onDismiss();
    }
  };
  
  const prevStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      >
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="relative">
            <button 
              onClick={onDismiss}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 z-10"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="p-6">
              <div className="mb-4 flex justify-center">
                <img 
                  src={steps[step].image} 
                  alt={steps[step].title}
                  className="h-40 w-auto"
                />
              </div>
              
              <h2 className="text-xl font-bold text-center mb-2">{steps[step].title}</h2>
              <p className="text-center text-gray-600 mb-6">{steps[step].description}</p>
              
              <div className="flex justify-between items-center">
                <Button 
                  onClick={prevStep} 
                  disabled={step === 0}
                  variant="outline"
                  className={step === 0 ? 'opacity-50 cursor-not-allowed' : ''}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                
                <div className="flex space-x-1">
                  {steps.map((_, index) => (
                    <div 
                      key={index}
                      className={`h-2 w-2 rounded-full ${index === step ? 'bg-blue-500' : 'bg-gray-300'}`}
                    />
                  ))}
                </div>
                
                <Button onClick={nextStep}>
                  {step === steps.length - 1 ? 'Get Started' : 'Next'} 
                  {step !== steps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingGuide;
