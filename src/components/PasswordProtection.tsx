import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface PasswordProtectionProps {
  children: React.ReactNode;
}

const CORRECT_PASSWORD = '11223344';
const PASSWORD_KEY = 'site_password_verified';

export const PasswordProtection = ({ children }: PasswordProtectionProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const verified = sessionStorage.getItem(PASSWORD_KEY);
    if (verified === 'true') {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(PASSWORD_KEY, 'true');
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Неверный пароль');
      setPassword('');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <Icon name="Loader2" size={40} className="text-white" />
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                <Icon name="Lock" size={32} className="text-white" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">Доступ закрыт</h1>
              <p className="text-slate-300">Введите пароль для входа</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Input
                  type="password"
                  placeholder="Введите пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-white/40 h-12 text-lg"
                  autoFocus
                />
                {error && (
                  <p className="text-red-300 text-sm mt-2 flex items-center gap-2">
                    <Icon name="AlertCircle" size={16} />
                    {error}
                  </p>
                )}
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-lg"
              >
                Войти
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
