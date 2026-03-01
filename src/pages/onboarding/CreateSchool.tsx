import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Building2, ArrowLeft, Loader2, CheckCircle2, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const CreateSchool = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
  });

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setForm(prev => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!form.name.trim() || !form.slug.trim()) {
      toast.error('Le nom et l\'URL sont obligatoires');
      return;
    }

    setLoading(true);
    try {
      // Check slug uniqueness
      const { data: existing } = await supabase
        .from('schools')
        .select('id')
        .eq('slug', form.slug)
        .maybeSingle();

      if (existing) {
        toast.error('Cette URL est déjà utilisée. Choisissez un autre identifiant.');
        setLoading(false);
        return;
      }

      // Create school
      const { data: school, error: schoolError } = await supabase
        .from('schools')
        .insert({
          name: form.name,
          slug: form.slug,
          description: form.description || null,
          address: form.address || null,
          phone: form.phone || null,
          email: form.email || null,
          website: form.website || null,
          created_by: user.id,
          is_active: false,
          is_verified: false,
          subscription_plan: 'free',
        })
        .select()
        .single();

      if (schoolError) throw schoolError;

      // Add creator as school admin/founder
      const { error: memberError } = await supabase
        .from('school_members')
        .insert({
          school_id: school.id,
          user_id: user.id,
          role: 'founder',
          is_active: true,
        });

      if (memberError) throw memberError;

      // Ensure user has founder role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: user.id,
          role: 'founder' as any,
        }, { onConflict: 'user_id,role' });

      setStep(3);
      toast.success('Établissement créé avec succès !');
    } catch (error: any) {
      console.error('Error creating school:', error);
      toast.error('Erreur lors de la création: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>

        {step === 1 && (
          <Card className="animate-slide-up">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Créer votre établissement</CardTitle>
              <CardDescription>
                Renseignez les informations principales de votre école
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom de l'établissement *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Groupe Scolaire Flora"
                  value={form.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">URL personnalisée *</Label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">schoolhubpro.com/</span>
                  <Input
                    id="slug"
                    placeholder="gs-flora"
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') }))}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Cette URL sera l'adresse unique de votre établissement
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Décrivez votre établissement..."
                  value={form.description}
                  onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <Button className="w-full" onClick={() => setStep(2)} disabled={!form.name || !form.slug}>
                Continuer
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="animate-slide-up">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Coordonnées</CardTitle>
              <CardDescription>
                Informations de contact (optionnel, modifiable plus tard)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="address" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Adresse
                </Label>
                <Input
                  id="address"
                  placeholder="Adresse complète"
                  value={form.address}
                  onChange={(e) => setForm(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="w-4 h-4" /> Téléphone
                  </Label>
                  <Input
                    id="phone"
                    placeholder="+237 6XX XXX XXX"
                    value={form.phone}
                    onChange={(e) => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="w-4 h-4" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@ecole.com"
                    value={form.email}
                    onChange={(e) => setForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Site web
                </Label>
                <Input
                  id="website"
                  placeholder="https://www.ecole.com"
                  value={form.website}
                  onChange={(e) => setForm(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Retour
                </Button>
                <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Création...
                    </>
                  ) : (
                    'Créer l\'établissement'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="animate-slide-up text-center">
            <CardContent className="pt-8 pb-8 space-y-6">
              <div className="w-20 h-20 bg-flora-success/20 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-flora-success" />
              </div>
              <div>
                <h2 className="text-2xl font-display font-bold mb-2">Établissement créé !</h2>
                <p className="text-muted-foreground">
                  Votre établissement <strong>{form.name}</strong> a été créé avec succès.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Un administrateur de la plateforme validera votre compte sous 24-48h.
                  Vous recevrez une notification dès l'activation.
                </p>
              </div>
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium">Votre URL</p>
                <p className="text-primary font-mono">schoolhubpro.com/{form.slug}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" asChild>
                  <Link to="/">Accueil</Link>
                </Button>
                <Button asChild>
                  <Link to="/founder">Mon tableau de bord</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CreateSchool;
