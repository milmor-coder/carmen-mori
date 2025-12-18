import React, { useState } from 'react';
import { auth, isConfigured } from '../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, AuthError } from 'firebase/auth';
import { Lock, Mail, ClipboardList, ArrowRight, UserPlus, LogIn, Wifi, CloudOff, ShieldCheck, AlertTriangle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Detect initialization failure: Configured but auth is null
  const initError = isConfigured && !auth;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth) {
        setError("Error de conexión: El servicio de autenticación no está disponible.");
        return;
    }
    
    setError(null);
    setLoading(true);

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      const firebaseError = err as AuthError;
      console.error(firebaseError);
      
      let msg = "Ocurrió un error. Intenta nuevamente.";
      if (firebaseError.code === 'auth/invalid-credential') msg = "Correo o contraseña incorrectos.";
      if (firebaseError.code === 'auth/email-already-in-use') msg = "Este correo ya está registrado.";
      if (firebaseError.code === 'auth/weak-password') msg = "La contraseña debe tener al menos 6 caracteres.";
      
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg shadow-blue-200">
            <ClipboardList size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-slate-900">
          EventMaster Manager
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600">
          {isRegistering ? 'Crea una cuenta para tu equipo' : 'Inicia sesión para gestionar tus eventos'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-slate-100">
          
          {initError && (
             <div className="mb-6 rounded-md bg-red-50 p-4 border border-red-100">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-5 w-5 text-red-400" aria-hidden="true" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Error de Inicialización</h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>No se pudo conectar con Firebase. Verifique la consola o la configuración.</p>
                    </div>
                  </div>
                </div>
              </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Correo electrónico
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={!!initError}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="admin@empresa.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                Contraseña
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  disabled={!!initError}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 rounded-md border-slate-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-2 border disabled:bg-slate-50 disabled:text-slate-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">{error}</h3>
                  </div>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading || !!initError}
                className="flex w-full justify-center rounded-lg border border-transparent bg-blue-600 py-2.5 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors items-center gap-2"
              >
                {loading ? 'Procesando...' : isRegistering ? (
                  <>
                    <UserPlus size={18} /> Registrarse
                  </>
                ) : (
                  <>
                    <LogIn size={18} /> Iniciar Sesión
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-2 text-slate-500">O continúa con</span>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setIsRegistering(!isRegistering);
                  setError(null);
                }}
                disabled={!!initError}
                className="text-blue-600 hover:text-blue-500 font-medium text-sm flex items-center justify-center gap-1 mx-auto disabled:text-slate-400"
              >
                {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Status Badge */}
        <div className="mt-8 flex justify-center">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border ${isConfigured ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
            {isConfigured ? (
              <>
                <Wifi size={14} />
                <span>Sistema en Línea (Firebase Cloud)</span>
                <ShieldCheck size={14} className="ml-1" />
              </>
            ) : (
              <>
                <CloudOff size={14} />
                <span>Modo Local (Sin conexión)</span>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};