import { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';

interface SimpleCaptchaProps {
  onVerify: (verified: boolean) => void;
}

export function SimpleCaptcha({ onVerify }: SimpleCaptchaProps) {
  const [num1, setNum1] = useState(0);
  const [num2, setNum2] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isVerified, setIsVerified] = useState(false);

  const generateNumbers = () => {
    setNum1(Math.floor(Math.random() * 10) + 1);
    setNum2(Math.floor(Math.random() * 10) + 1);
    setUserAnswer('');
    setIsVerified(false);
    onVerify(false);
  };

  useEffect(() => {
    generateNumbers();
  }, []);

  const handleVerify = (value: string) => {
    setUserAnswer(value);
    const correctAnswer = num1 + num2;
    const verified = parseInt(value) === correctAnswer;
    setIsVerified(verified);
    onVerify(verified);
  };

  return (
    <div className="border-2 border-border rounded-lg p-6 bg-secondary">
      <div className="flex items-center justify-between mb-4">
        <label className="text-foreground">Verificación de seguridad</label>
        <button
          type="button"
          onClick={generateNumbers}
          className="p-2 hover:bg-accent rounded-lg transition-colors"
          title="Generar nuevo captcha"
        >
          <RefreshCw className="w-4 h-4 text-primary" />
        </button>
      </div>
      
      <div className="flex items-center gap-4 mb-4">
        <div className="bg-white border-2 border-primary rounded-lg p-4 flex items-center justify-center gap-3 select-none">
          <span className="text-2xl text-primary font-mono tracking-wider">{num1}</span>
          <span className="text-2xl text-primary">+</span>
          <span className="text-2xl text-primary font-mono tracking-wider">{num2}</span>
          <span className="text-2xl text-primary">=</span>
          <span className="text-2xl text-muted-foreground">?</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <input
          type="number"
          value={userAnswer}
          onChange={(e) => handleVerify(e.target.value)}
          placeholder="Ingresa el resultado"
          className={`flex-1 px-4 py-3 bg-white border-2 rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            isVerified 
              ? 'border-green-500 focus:ring-green-500' 
              : userAnswer && !isVerified
              ? 'border-destructive focus:ring-destructive'
              : 'border-border focus:ring-primary'
          }`}
        />
        {isVerified && (
          <div className="flex items-center gap-2 text-green-600 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
            <span className="text-xl">✓</span>
            <span className="text-sm">Verificado</span>
          </div>
        )}
      </div>
      
      {userAnswer && !isVerified && (
        <p className="text-sm text-destructive mt-2">
          Respuesta incorrecta. Por favor, intenta nuevamente.
        </p>
      )}
    </div>
  );
}
