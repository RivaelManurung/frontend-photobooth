import { useEffect, useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { promoAPI, adminAPI } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useToast } from '../../components/ui/Toast';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

const Promos = () => {
  const { addToast } = useToast();
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [promoToDelete, setPromoToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchPromos();
  }, []);

  const fetchPromos = async () => {
    try {
      setLoading(true);
      const response = await promoAPI.getPromoCodes();
      setPromos(response.data.promo_codes || []);
    } catch (error) {
      console.error('Error fetching promos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (promo) => {
    setPromoToDelete(promo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!promoToDelete) return;
    
    try {
      setIsDeleting(true);
      await adminAPI.deletePromoCode(promoToDelete.id);
      addToast({
        title: 'Success',
        description: 'Promo code deleted successfully',
        variant: 'success'
      });
      fetchPromos();
    } catch (error) {
      console.error('Error deleting promo:', error);
      addToast({
        title: 'Error',
        description: 'Failed to delete promo code',
        variant: 'error'
      });
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPromoToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Promo Codes</h1>
          <p className="text-muted-foreground">Manage promotional codes</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Promo
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Promos</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Discount</TableHead>
                  <TableHead>Usage</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promos.map((promo) => (
                  <TableRow key={promo.id}>
                    <TableCell className="font-mono font-medium">{promo.code}</TableCell>
                    <TableCell>{promo.description}</TableCell>
                    <TableCell>
                      {promo.type === 'percentage' 
                        ? `${promo.discount_percent}%` 
                        : `Rp ${promo.discount_amount}`}
                    </TableCell>
                    <TableCell>
                      {promo.used_count} / {promo.max_uses || '∞'}
                    </TableCell>
                    <TableCell>{formatDate(promo.expires_at)}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        promo.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {promo.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteClick(promo)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title="Hapus Promo Code"
        description={`Apakah Anda yakin ingin menghapus promo code "${promoToDelete?.code}"? Pengguna tidak akan bisa lagi menggunakan kode ini.`}
      />
    </div>
  );
};

export default Promos;
