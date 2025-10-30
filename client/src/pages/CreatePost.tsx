import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/auth';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { is } from '@/i18n/is';
import type { SalePostWithDetails } from '@shared/schema';

const categories = [
  { value: 'fatnad', label: is.categories.fatnad },
  { value: 'husgogn', label: is.categories.husgogn },
  { value: 'raftaeki', label: is.categories.raftaeki },
  { value: 'matvorur', label: is.categories.matvorur },
  { value: 'annad', label: is.categories.annad },
];

export default function CreatePost() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { authUser, isStore } = useAuth();
  const isEdit = !!id;

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [priceOriginal, setPriceOriginal] = useState('');
  const [priceSale, setPriceSale] = useState('');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [images, setImages] = useState<{ url: string; alt?: string }[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data: existingPost } = useQuery<SalePostWithDetails>({
    queryKey: [`/api/v1/posts/${id}`],
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingPost) {
      setTitle(existingPost.title);
      setDescription(existingPost.description || '');
      setCategory(existingPost.category);
      setPriceOriginal(existingPost.priceOriginal.toString());
      setPriceSale(existingPost.priceSale.toString());
      setStartsAt(new Date(existingPost.startsAt).toISOString().slice(0, 16));
      setEndsAt(new Date(existingPost.endsAt).toISOString().slice(0, 16));
      setImages(existingPost.images);
    }
  }, [existingPost]);

  if (!isStore) {
    setLocation('/innskraning');
    return null;
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 5 * 1024 * 1024) {
          toast({
            variant: 'destructive',
            title: 'Villa',
            description: is.upload.maxSize,
          });
          continue;
        }

        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/v1/uploads', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authUser?.token}`,
          },
          body: formData,
        });

        if (!response.ok) throw new Error('Upload failed');

        const data = await response.json();
        setImages(prev => [...prev, { url: data.url, alt: '' }]);
      }
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: is.upload.uploadError,
      });
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const createMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('POST', '/api/v1/posts', {
        title,
        description,
        category,
        priceOriginal: parseFloat(priceOriginal),
        priceSale: parseFloat(priceSale),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        images,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Útsala búin til',
        description: 'Útsalan hefur verið birt',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stores/${authUser?.store?.id}/posts`] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: error.message || 'Ekki tókst að búa til útsölu',
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('PUT', `/api/v1/posts/${id}`, {
        title,
        description,
        category,
        priceOriginal: parseFloat(priceOriginal),
        priceSale: parseFloat(priceSale),
        startsAt: new Date(startsAt).toISOString(),
        endsAt: new Date(endsAt).toISOString(),
        images,
      });
    },
    onSuccess: () => {
      toast({
        title: 'Útsala uppfærð',
        description: 'Breytingar hafa verið vistaðar',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/posts/${id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stores/${authUser?.store?.id}/posts`] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: error.message || 'Ekki tókst að uppfæra útsölu',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', `/api/v1/posts/${id}`, {});
    },
    onSuccess: () => {
      toast({
        title: 'Útsölu eytt',
        description: 'Útsalan hefur verið fjarlægð',
      });
      queryClient.invalidateQueries({ queryKey: [`/api/v1/stores/${authUser?.store?.id}/posts`] });
      setLocation('/dashboard');
    },
    onError: (error: any) => {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: error.message || 'Ekki tókst að eyða útsölu',
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (images.length === 0) {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: is.createPost.errors.imageRequired,
      });
      return;
    }

    if (parseFloat(priceSale) >= parseFloat(priceOriginal)) {
      toast({
        variant: 'destructive',
        title: 'Villa',
        description: is.createPost.errors.salePriceHigher,
      });
      return;
    }

    if (isEdit) {
      updateMutation.mutate();
    } else {
      createMutation.mutate();
    }
  };

  const handleDelete = () => {
    if (confirm(is.createPost.confirmDelete)) {
      deleteMutation.mutate();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 bg-card border-b border-card-border">
        <div className="flex items-center gap-2 p-2">
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setLocation('/dashboard')}
            data-testid="button-back"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-lg font-semibold" data-testid="text-title">
            {isEdit ? is.createPost.editTitle : is.createPost.title}
          </h1>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">{is.createPost.basicInfo}</h2>

          <div className="space-y-2">
            <Label htmlFor="title">{is.createPost.postTitle}</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{is.createPost.postDescription}</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              data-testid="input-description"
            />
          </div>

          <div className="space-y-2">
            <Label>{is.createPost.category}</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger data-testid="select-category">
                <SelectValue placeholder={is.createPost.selectCategory} />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">{is.createPost.pricing}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priceOriginal">{is.createPost.originalPrice}</Label>
              <Input
                id="priceOriginal"
                type="number"
                step="1"
                min="0"
                value={priceOriginal}
                onChange={(e) => setPriceOriginal(e.target.value)}
                required
                data-testid="input-price-original"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceSale">{is.createPost.salePrice}</Label>
              <Input
                id="priceSale"
                type="number"
                step="1"
                min="0"
                value={priceSale}
                onChange={(e) => setPriceSale(e.target.value)}
                required
                data-testid="input-price-sale"
              />
            </div>
          </div>

          {priceOriginal && priceSale && parseFloat(priceSale) < parseFloat(priceOriginal) && (
            <div className="bg-primary/10 text-primary p-3 rounded-lg text-sm font-medium">
              Afsláttur: {Math.round((1 - parseFloat(priceSale) / parseFloat(priceOriginal)) * 100)}%
            </div>
          )}
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">{is.createPost.dates}</h2>

          <div className="space-y-2">
            <Label htmlFor="startsAt">{is.createPost.startDate}</Label>
            <Input
              id="startsAt"
              type="datetime-local"
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              required
              data-testid="input-start-date"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endsAt">{is.createPost.endDate}</Label>
            <Input
              id="endsAt"
              type="datetime-local"
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              required
              data-testid="input-end-date"
            />
          </div>
        </Card>

        <Card className="p-4 space-y-4">
          <h2 className="font-semibold">{is.createPost.images}</h2>

          <div className="grid grid-cols-3 gap-3">
            {images.map((img, index) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-1 right-1 h-6 w-6"
                  onClick={() => removeImage(index)}
                  data-testid={`button-remove-image-${index}`}
                >
                  <X size={14} />
                </Button>
              </div>
            ))}

            <label className="aspect-square border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover-elevate active-elevate-2">
              <Upload size={24} className="text-muted-foreground mb-1" />
              <span className="text-xs text-muted-foreground text-center px-2">
                {uploading ? is.upload.uploading : is.createPost.addImage}
              </span>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
                data-testid="input-image"
              />
            </label>
          </div>
        </Card>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={createMutation.isPending || updateMutation.isPending}
            data-testid="button-submit"
          >
            {isEdit ? is.createPost.updateButton : is.createPost.createButton}
          </Button>

          {isEdit && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-delete"
            >
              {is.createPost.deleteButton}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
