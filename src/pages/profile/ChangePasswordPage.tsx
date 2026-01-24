import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  CheckCircle, 
  Loader2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import logoFlora from '@/assets/logo-flora.jpeg';

const ChangePasswordPage = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    new_password: '',
    confirm_password: '',
  });
  const [passwordStrength, setPasswordStrength] = useState(0);

  useEffect(() => {
    // Calculate password strength
    const password = formData.new_password;
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password) || /[^a-zA-Z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [formData.new_password]);

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return 'bg-red-500';
    if (passwordStrength <= 50) return 'bg-orange-500';
    if (passwordStrength <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (passwordStrength <= 25) return 'Faible';
    if (passwordStrength <= 50) return 'Moyen';
    if (passwordStrength <= 75) return 'Bon';
    return 'Excellent';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.new_password || !formData.confirm_password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (formData.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.new_password,
      });

      if (error) throw error;

      // Mark password as changed
      if (user) {
        await supabase
          .from('user_settings')
          .upsert({
            user_id: user.id,
            must_change_password: false,
            password_changed_at: new Date().toISOString(),
          }, { onConflict: 'user_id' });
      }

      toast.success('Mot de passe modifié avec succès !');
      
      // Redirect to appropriate dashboard based on role
      const redirectMap: Record<string, string> = {
        super_admin: '/admin',
        admin: '/admin',
        founder: '/founder',
        director: '/director',
        censor: '/censor',
        educator: '/educator',
        principal_teacher: '/principal-teacher',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
      };
      
      navigate(redirectMap[role || ''] || '/');
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto">
            <img src={logoFlora} alt="Flora Campus" className="w-20 h-20 rounded-full shadow-lg" />
          </div>
          <div>
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Changement de mot de passe
            </CardTitle>
            <CardDescription className="mt-2">
              Pour des raisons de sécurité, vous devez modifier votre mot de passe par défaut
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              C'est votre première connexion. Veuillez créer un nouveau mot de passe sécurisé pour continuer.
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new_password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="new_password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.new_password}
                  onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="Entrez votre nouveau mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              
              {/* Password strength indicator */}
              {formData.new_password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          i < passwordStrength / 25 ? getStrengthColor() : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Force du mot de passe: <span className={getStrengthColor().replace('bg-', 'text-')}>{getStrengthLabel()}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="confirm_password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirm_password}
                  onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                  className="pl-10 pr-10"
                  placeholder="Confirmez votre mot de passe"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              {formData.confirm_password && formData.new_password !== formData.confirm_password && (
                <p className="text-xs text-red-500">Les mots de passe ne correspondent pas</p>
              )}
              {formData.confirm_password && formData.new_password === formData.confirm_password && (
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" />
                  Les mots de passe correspondent
                </p>
              )}
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Le mot de passe doit contenir :</p>
              <ul className="list-disc pl-5 space-y-0.5">
                <li className={formData.new_password.length >= 8 ? 'text-green-600' : ''}>
                  Au moins 8 caractères
                </li>
                <li className={/[a-z]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  Une lettre minuscule
                </li>
                <li className={/[A-Z]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  Une lettre majuscule
                </li>
                <li className={/[0-9]/.test(formData.new_password) ? 'text-green-600' : ''}>
                  Un chiffre
                </li>
              </ul>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || passwordStrength < 75}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Confirmer le nouveau mot de passe
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
