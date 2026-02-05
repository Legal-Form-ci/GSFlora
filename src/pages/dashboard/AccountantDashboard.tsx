import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Plus,
  Download,
  CreditCard,
  Receipt,
  PieChart,
  LayoutDashboard
} from "lucide-react";
import jsPDF from "jspdf";

const AccountantDashboard = () => {
  const queryClient = useQueryClient();
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [isFeeDialogOpen, setIsFeeDialogOpen] = useState(false);
  const currentYear = "2024-2025";

  // Fetch classes
  const { data: classes = [] } = useQuery({
    queryKey: ["classes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("classes").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  // Fetch students with their classes
  const { data: students = [] } = useQuery({
    queryKey: ["students-for-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles!inner(role),
          student_classes(class_id, classes(name))
        `)
        .eq("user_roles.role", "student");
      if (error) throw error;
      return data;
    },
  });

  // Fetch tuition fees
  const { data: tuitionFees = [] } = useQuery({
    queryKey: ["tuition-fees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tuition_fees")
        .select("*, classes(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch payments
  const { data: payments = [] } = useQuery({
    queryKey: ["student-payments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("student_payments")
        .select("*, profiles(first_name, last_name), tuition_fees(school_year, classes(name))")
        .order("payment_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch expenses
  const { data: expenses = [] } = useQuery({
    queryKey: ["school-expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("school_expenses")
        .select("*")
        .order("expense_date", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Calculate stats
  const totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netBalance = totalRevenue - totalExpenses;
  const totalStudents = students.length;

  // Add payment mutation
  const addPaymentMutation = useMutation({
    mutationFn: async (payment: {
      student_id: string;
      tuition_fee_id: string;
      amount: number;
      payment_method: string;
      notes?: string;
    }) => {
      const receiptNumber = `REC-${Date.now()}`;
      const { error } = await supabase.from("student_payments").insert({
        ...payment,
        receipt_number: receiptNumber,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-payments"] });
      setIsPaymentDialogOpen(false);
      toast({ title: "Paiement enregistré avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" });
    },
  });

  // Add expense mutation
  const addExpenseMutation = useMutation({
    mutationFn: async (expense: {
      category: string;
      description: string;
      amount: number;
    }) => {
      const { error } = await supabase.from("school_expenses").insert(expense);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["school-expenses"] });
      setIsExpenseDialogOpen(false);
      toast({ title: "Dépense enregistrée avec succès" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" });
    },
  });

  // Add tuition fee mutation
  const addFeeMutation = useMutation({
    mutationFn: async (fee: {
      class_id: string;
      school_year: string;
      registration_fee: number;
      tuition_fee: number;
      other_fees: number;
    }) => {
      const { error } = await supabase.from("tuition_fees").insert(fee);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tuition-fees"] });
      setIsFeeDialogOpen(false);
      toast({ title: "Frais de scolarité enregistrés" });
    },
    onError: () => {
      toast({ title: "Erreur lors de l'enregistrement", variant: "destructive" });
    },
  });

  const handleAddPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addPaymentMutation.mutate({
      student_id: formData.get("student_id") as string,
      tuition_fee_id: formData.get("tuition_fee_id") as string,
      amount: Number(formData.get("amount")),
      payment_method: formData.get("payment_method") as string,
      notes: formData.get("notes") as string,
    });
  };

  const handleAddExpense = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addExpenseMutation.mutate({
      category: formData.get("category") as string,
      description: formData.get("description") as string,
      amount: Number(formData.get("amount")),
    });
  };

  const handleAddFee = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    addFeeMutation.mutate({
      class_id: formData.get("class_id") as string,
      school_year: currentYear,
      registration_fee: Number(formData.get("registration_fee")),
      tuition_fee: Number(formData.get("tuition_fee")),
      other_fees: Number(formData.get("other_fees")),
    });
  };

  const generateFinancialReport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, pageWidth, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("RAPPORT FINANCIER", pageWidth / 2, 20, { align: "center" });
    doc.setFontSize(14);
    doc.text(`Année scolaire ${currentYear}`, pageWidth / 2, 32, { align: "center" });

    doc.setTextColor(0, 0, 0);
    let yPos = 55;

    // Summary section
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("RÉSUMÉ FINANCIER", 20, yPos);
    yPos += 15;

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Total des recettes: ${totalRevenue.toLocaleString()} FCFA`, 25, yPos);
    yPos += 10;
    doc.text(`Total des dépenses: ${totalExpenses.toLocaleString()} FCFA`, 25, yPos);
    yPos += 10;
    doc.setFont("helvetica", "bold");
    doc.text(`Solde net: ${netBalance.toLocaleString()} FCFA`, 25, yPos);
    yPos += 20;

    // Recent payments
    doc.setFontSize(16);
    doc.text("DERNIERS PAIEMENTS", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const recentPayments = payments.slice(0, 10);
    recentPayments.forEach((p: any) => {
      doc.text(
        `${p.profiles?.first_name} ${p.profiles?.last_name} - ${Number(p.amount).toLocaleString()} FCFA - ${format(new Date(p.payment_date), "dd/MM/yyyy")}`,
        25,
        yPos
      );
      yPos += 7;
    });

    yPos += 10;

    // Recent expenses
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("DERNIÈRES DÉPENSES", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    const recentExpenses = expenses.slice(0, 10);
    recentExpenses.forEach((e: any) => {
      doc.text(
        `${e.category} - ${e.description.substring(0, 30)} - ${Number(e.amount).toLocaleString()} FCFA`,
        25,
        yPos
      );
      yPos += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.text(
      `Généré le ${format(new Date(), "dd MMMM yyyy à HH:mm", { locale: fr })}`,
      pageWidth / 2,
      285,
      { align: "center" }
    );

    doc.save(`rapport_financier_${currentYear}.pdf`);
    toast({ title: "Rapport financier généré" });
  };

  const expenseCategories = [
    "Salaires",
    "Fournitures",
    "Maintenance",
    "Électricité",
    "Eau",
    "Internet",
    "Transport",
    "Événements",
    "Autres",
  ];

  return (
    <DashboardLayout 
      title="Tableau de Bord Comptable" 
      navItems={[
        { label: "Tableau de bord", href: "/accountant", icon: <LayoutDashboard className="w-5 h-5" /> },
        { label: "Paiements", href: "/accountant/payments", icon: <CreditCard className="w-5 h-5" /> },
        { label: "Dépenses", href: "/accountant/expenses", icon: <Receipt className="w-5 h-5" /> },
        { label: "Frais de scolarité", href: "/accountant/fees", icon: <PieChart className="w-5 h-5" /> },
      ]}
    >
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Recettes</CardTitle>
              <TrendingUp className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalRevenue.toLocaleString()} FCFA</div>
              <p className="text-xs opacity-80 mt-1">{payments.length} paiements</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Total Dépenses</CardTitle>
              <TrendingDown className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalExpenses.toLocaleString()} FCFA</div>
              <p className="text-xs opacity-80 mt-1">{expenses.length} dépenses</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Solde Net</CardTitle>
              <DollarSign className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{netBalance.toLocaleString()} FCFA</div>
              <p className="text-xs opacity-80 mt-1">
                {netBalance >= 0 ? "Bénéfice" : "Déficit"}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium opacity-90">Élèves Inscrits</CardTitle>
              <Users className="h-5 w-5 opacity-80" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalStudents}</div>
              <p className="text-xs opacity-80 mt-1">Année {currentYear}</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3">
          <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nouveau Paiement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Enregistrer un Paiement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddPayment} className="space-y-4">
                <div>
                  <Label htmlFor="student_id">Élève</Label>
                  <Select name="student_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un élève" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((s: any) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.first_name} {s.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="tuition_fee_id">Frais de scolarité</Label>
                  <Select name="tuition_fee_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner les frais" />
                    </SelectTrigger>
                    <SelectContent>
                      {tuitionFees.map((f: any) => (
                        <SelectItem key={f.id} value={f.id}>
                          {f.classes?.name} - {f.school_year} ({Number(f.total_amount).toLocaleString()} FCFA)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input type="number" name="amount" required min="0" />
                </div>
                <div>
                  <Label htmlFor="payment_method">Mode de paiement</Label>
                  <Select name="payment_method" defaultValue="cash">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Espèces</SelectItem>
                      <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                      <SelectItem value="mobile_money">Mobile Money</SelectItem>
                      <SelectItem value="check">Chèque</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Input name="notes" placeholder="Notes optionnelles" />
                </div>
                <Button type="submit" className="w-full" disabled={addPaymentMutation.isPending}>
                  Enregistrer le paiement
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-red-500 text-red-600 hover:bg-red-50">
                <Receipt className="w-4 h-4 mr-2" />
                Nouvelle Dépense
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Enregistrer une Dépense</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddExpense} className="space-y-4">
                <div>
                  <Label htmlFor="category">Catégorie</Label>
                  <Select name="category" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Input name="description" required placeholder="Description de la dépense" />
                </div>
                <div>
                  <Label htmlFor="amount">Montant (FCFA)</Label>
                  <Input type="number" name="amount" required min="0" />
                </div>
                <Button type="submit" className="w-full" disabled={addExpenseMutation.isPending}>
                  Enregistrer la dépense
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={isFeeDialogOpen} onOpenChange={setIsFeeDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Définir Frais de Scolarité
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Définir les Frais de Scolarité</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddFee} className="space-y-4">
                <div>
                  <Label htmlFor="class_id">Classe</Label>
                  <Select name="class_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une classe" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c: any) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="registration_fee">Frais d'inscription (FCFA)</Label>
                  <Input type="number" name="registration_fee" required min="0" defaultValue="0" />
                </div>
                <div>
                  <Label htmlFor="tuition_fee">Frais de scolarité (FCFA)</Label>
                  <Input type="number" name="tuition_fee" required min="0" defaultValue="0" />
                </div>
                <div>
                  <Label htmlFor="other_fees">Autres frais (FCFA)</Label>
                  <Input type="number" name="other_fees" min="0" defaultValue="0" />
                </div>
                <Button type="submit" className="w-full" disabled={addFeeMutation.isPending}>
                  Enregistrer les frais
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Button variant="outline" onClick={generateFinancialReport}>
            <Download className="w-4 h-4 mr-2" />
            Rapport PDF
          </Button>
        </div>

        {/* Tabs for different views */}
        <Tabs defaultValue="payments" className="space-y-4">
          <TabsList>
            <TabsTrigger value="payments">Paiements</TabsTrigger>
            <TabsTrigger value="expenses">Dépenses</TabsTrigger>
            <TabsTrigger value="fees">Frais de Scolarité</TabsTrigger>
          </TabsList>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Historique des Paiements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Élève</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Mode</TableHead>
                      <TableHead>Reçu</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payments.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell>{format(new Date(p.payment_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell className="font-medium">
                          {p.profiles?.first_name} {p.profiles?.last_name}
                        </TableCell>
                        <TableCell>{p.tuition_fees?.classes?.name || "-"}</TableCell>
                        <TableCell className="font-semibold text-green-600">
                          {Number(p.amount).toLocaleString()} FCFA
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {p.payment_method === "cash" && "Espèces"}
                            {p.payment_method === "bank_transfer" && "Virement"}
                            {p.payment_method === "mobile_money" && "Mobile Money"}
                            {p.payment_method === "check" && "Chèque"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{p.receipt_number}</TableCell>
                      </TableRow>
                    ))}
                    {payments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun paiement enregistré
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Receipt className="h-5 w-5" />
                  Historique des Dépenses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Montant</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell>{format(new Date(e.expense_date), "dd/MM/yyyy")}</TableCell>
                        <TableCell>
                          <Badge>{e.category}</Badge>
                        </TableCell>
                        <TableCell>{e.description}</TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {Number(e.amount).toLocaleString()} FCFA
                        </TableCell>
                      </TableRow>
                    ))}
                    {expenses.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          Aucune dépense enregistrée
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Grille des Frais de Scolarité
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Classe</TableHead>
                      <TableHead>Année</TableHead>
                      <TableHead>Inscription</TableHead>
                      <TableHead>Scolarité</TableHead>
                      <TableHead>Autres</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tuitionFees.map((f: any) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium">{f.classes?.name}</TableCell>
                        <TableCell>{f.school_year}</TableCell>
                        <TableCell>{Number(f.registration_fee).toLocaleString()} FCFA</TableCell>
                        <TableCell>{Number(f.tuition_fee).toLocaleString()} FCFA</TableCell>
                        <TableCell>{Number(f.other_fees).toLocaleString()} FCFA</TableCell>
                        <TableCell className="font-bold text-blue-600">
                          {Number(f.total_amount).toLocaleString()} FCFA
                        </TableCell>
                      </TableRow>
                    ))}
                    {tuitionFees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          Aucun frais de scolarité défini
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default AccountantDashboard;
