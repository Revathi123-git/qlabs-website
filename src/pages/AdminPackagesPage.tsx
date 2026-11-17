
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  RefreshCw,
  Upload,
  X,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Package,
  Trash2,
  ChevronUp,
  ChevronDown,
  FlaskConical,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface PackageRecord {
  id: string;
  package_name: string;
  category: string;
  description: string | null;
  price: number;
  is_active: boolean;
  display_order: number;
  image_path: string | null;
}

interface TestOption {
  id: string;
  name: string;
  is_active: boolean;
}

interface PackageItemRecord {
  id: string;
  package_id: string;
  test_id: string | null;
  display_name: string;
  display_order: number;
}

interface PackageItemDraft {
  key: string;
  kind: 'test' | 'custom';
  testId: string;
  displayName: string;
}

interface PackageForm {
  packageName: string;
  category: string;
  description: string;
  price: string;
  displayOrder: string;
  isActive: boolean;
}

const BUCKET_NAME = 'catalogue-images';

const emptyForm: PackageForm = {
  packageName: '',
  category: '',
  description: '',
  price: '',
  displayOrder: '0',
  isActive: true,
};

function getImageUrl(path: string | null) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  return supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path).data.publicUrl;
}

function formatPrice(value: number) {
  return `₹${Number(value).toLocaleString('en-IN')}`;
}

function newItemKey() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function AdminPackagesPage() {
  const [packages, setPackages] = useState<PackageRecord[]>([]);
  const [packageItems, setPackageItems] = useState<PackageItemRecord[]>([]);
  const [availableTests, setAvailableTests] = useState<TestOption[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] =
    useState<PackageRecord | null>(null);

  const [form, setForm] = useState<PackageForm>(emptyForm);
  const [items, setItems] = useState<PackageItemDraft[]>([]);

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Load packages, their contents and the available tests.
  async function loadData() {
    setLoading(true);
    setError('');

    const [packagesResult, itemsResult, testsResult] =
      await Promise.all([
        supabase
          .from('test_packages')
          .select(
            'id, package_name, category, description, price, is_active, display_order, image_path',
          )
          .order('display_order', { ascending: true })
          .order('package_name', { ascending: true }),

        supabase
          .from('package_items')
          .select(
            'id, package_id, test_id, display_name, display_order',
          )
          .order('display_order', { ascending: true }),

        supabase
          .from('tests')
          .select('id, name, is_active')
          .order('display_order', { ascending: true })
          .order('name', { ascending: true }),
      ]);

    if (
      packagesResult.error ||
      itemsResult.error ||
      testsResult.error
    ) {
      setError(
        packagesResult.error?.message ||
          itemsResult.error?.message ||
          testsResult.error?.message ||
          'Unable to load package data.',
      );
    } else {
      setPackages((packagesResult.data ?? []) as PackageRecord[]);
      setPackageItems((itemsResult.data ?? []) as PackageItemRecord[]);
      setAvailableTests((testsResult.data ?? []) as TestOption[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  // Release temporary image preview URLs.
  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const filteredPackages = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return packages.filter((item) => {
      const matchesSearch =
        !normalizedSearch ||
        item.package_name.toLowerCase().includes(normalizedSearch) ||
        item.category.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && item.is_active) ||
        (filter === 'inactive' && !item.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [packages, search, filter]);

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};

    for (const item of packageItems) {
      counts[item.package_id] =
        (counts[item.package_id] ?? 0) + 1;
    }

    return counts;
  }, [packageItems]);

  function updateForm<K extends keyof PackageForm>(
    key: K,
    value: PackageForm[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function openNewForm() {
    setEditingPackage(null);
    setForm(emptyForm);
    setItems([]);
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
    setMessage('');
    setShowForm(true);
  }

  function openEditForm(item: PackageRecord) {
    const existingItems = packageItems
      .filter((entry) => entry.package_id === item.id)
      .sort((a, b) => a.display_order - b.display_order);

    setEditingPackage(item);

    setForm({
      packageName: item.package_name,
      category: item.category,
      description: item.description ?? '',
      price: String(item.price),
      displayOrder: String(item.display_order),
      isActive: item.is_active,
    });

    setItems(
      existingItems.map((entry) => ({
        key: entry.id,
        kind: entry.test_id ? 'test' : 'custom',
        testId: entry.test_id ?? '',
        displayName: entry.display_name,
      })),
    );

    setSelectedImage(null);
    setImagePreview(getImageUrl(item.image_path));
    setError('');
    setMessage('');
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;

    setShowForm(false);
    setEditingPackage(null);
    setForm(emptyForm);
    setItems([]);
    setSelectedImage(null);
    setImagePreview(null);
    setError('');
  }

  function addTestItem() {
    setItems((current) => [
      ...current,
      {
        key: newItemKey(),
        kind: 'test',
        testId: '',
        displayName: '',
      },
    ]);
  }

  function addCustomItem() {
    setItems((current) => [
      ...current,
      {
        key: newItemKey(),
        kind: 'custom',
        testId: '',
        displayName: '',
      },
    ]);
  }

  function updateItem(
    key: string,
    changes: Partial<PackageItemDraft>,
  ) {
    setItems((current) =>
      current.map((item) =>
        item.key === key
          ? { ...item, ...changes }
          : item,
      ),
    );
  }

  function removeItem(key: string) {
    setItems((current) =>
      current.filter((item) => item.key !== key),
    );
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= items.length) return;

    setItems((current) => {
      const updated = [...current];

      [updated[index], updated[nextIndex]] = [
        updated[nextIndex],
        updated[index],
      ];

      return updated;
    });
  }

  function handleImageChange(file: File | null) {
    setError('');

    if (!file) {
      setSelectedImage(null);
      setImagePreview(
        editingPackage
          ? getImageUrl(editingPackage.image_path)
          : null,
      );
      return;
    }

    if (
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    ) {
      setError('Please select a JPG, PNG or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be 5 MB or less.');
      return;
    }

    setSelectedImage(file);
    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadPackageImage(packageId: string) {
    if (!selectedImage) return null;

    setUploading(true);

    try {
      const extension =
        selectedImage.name.split('.').pop()?.toLowerCase() || 'jpg';

      const imagePath =
        `packages/${packageId}/${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(imagePath, selectedImage, {
          cacheControl: '3600',
          upsert: false,
          contentType: selectedImage.type,
        });

      if (uploadError) {
        throw new Error(
          `Image upload failed: ${uploadError.message}`,
        );
      }

      return imagePath;
    } finally {
      setUploading(false);
    }
  }

  async function savePackage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError('');
    setMessage('');

    const packageName = form.packageName.trim();
    const category = form.category.trim();
    const price = Number(form.price);
    const displayOrder = Number(form.displayOrder);

    if (!packageName) {
      setError('Please enter a package name.');
      return;
    }

    if (!category) {
      setError('Please enter a package category.');
      return;
    }

    if (
      form.price.trim() === '' ||
      !Number.isFinite(price) ||
      price < 0
    ) {
      setError('Please enter a valid package price.');
      return;
    }

    if (
      !Number.isInteger(displayOrder) ||
      displayOrder < 0
    ) {
      setError('Display order must be a whole number of zero or more.');
      return;
    }

    if (items.length === 0) {
      setError('Please add at least one package item.');
      return;
    }

    for (const item of items) {
      if (!item.displayName.trim()) {
        setError('Every package item must have a display name.');
        return;
      }

      if (item.kind === 'test' && !item.testId) {
        setError('Please select a test for every linked test item.');
        return;
      }
    }

    const selectedTestIds = items
      .filter((item) => item.kind === 'test')
      .map((item) => item.testId);

    if (new Set(selectedTestIds).size !== selectedTestIds.length) {
      setError('The same individual test cannot be added twice.');
      return;
    }

    setSaving(true);

    try {
      const packagePayload = {
        package_name: packageName,
        category,
        description: form.description.trim() || null,
        price,
        is_active: form.isActive,
        display_order: displayOrder,
      };

      let savedPackageId = editingPackage?.id;

      // Create or update package details.
      if (editingPackage) {
        const { error: updateError } = await supabase
          .from('test_packages')
          .update(packagePayload)
          .eq('id', editingPackage.id);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('test_packages')
          .insert(packagePayload)
          .select('id')
          .single();

        if (insertError) throw insertError;

        savedPackageId = data.id;
      }

      if (!savedPackageId) {
        throw new Error('Could not retrieve the saved package ID.');
      }

      // Replace package contents.
      // The tests_included legacy column is deliberately untouched.
      const { error: deleteItemsError } = await supabase
        .from('package_items')
        .delete()
        .eq('package_id', savedPackageId);

      if (deleteItemsError) {
        throw new Error(
          `Package saved, but existing items could not be replaced: ${deleteItemsError.message}`,
        );
      }

      const itemPayload = items.map((item, index) => ({
        package_id: savedPackageId,
        test_id: item.kind === 'test' ? item.testId : null,
        display_name: item.displayName.trim(),
        display_order: index,
      }));

      const { error: insertItemsError } = await supabase
        .from('package_items')
        .insert(itemPayload);

      if (insertItemsError) {
        throw new Error(
          `Package saved, but its contents could not be saved: ${insertItemsError.message}`,
        );
      }

      // Upload and associate optional package image.
      if (selectedImage) {
        const imagePath = await uploadPackageImage(savedPackageId);

        if (imagePath) {
          const { error: imageError } = await supabase
            .from('test_packages')
            .update({ image_path: imagePath })
            .eq('id', savedPackageId);

          if (imageError) {
            throw new Error(
              `Package saved, but image path could not be updated: ${imageError.message}`,
            );
          }
        }
      }

      setShowForm(false);
      setEditingPackage(null);
      setSelectedImage(null);
      setImagePreview(null);
      setForm(emptyForm);
      setItems([]);

      await loadData();

      setMessage(
        editingPackage
          ? 'Package updated successfully.'
          : 'New package added successfully.',
      );
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save package.',
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function togglePackageStatus(item: PackageRecord) {
    const nextStatus = !item.is_active;

    if (
      !window.confirm(
        `${nextStatus ? 'Activate' : 'Deactivate'} "${item.package_name}"?`,
      )
    ) {
      return;
    }

    setError('');
    setMessage('');

    const { error: updateError } = await supabase
      .from('test_packages')
      .update({ is_active: nextStatus })
      .eq('id', item.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setPackages((current) =>
      current.map((pkg) =>
        pkg.id === item.id
          ? { ...pkg, is_active: nextStatus }
          : pkg,
      ),
    );

    setMessage(
      nextStatus
        ? 'Package activated successfully.'
        : 'Package deactivated successfully.',
    );
  }

  async function deletePackage(item: PackageRecord) {
    if (
      !window.confirm(
        `Delete "${item.package_name}" permanently? Its package items will also be deleted. Individual tests in the main catalogue will not be deleted.`,
      )
    ) {
      return;
    }

    setError('');
    setMessage('');

    // Delete child rows first because the foreign key may not cascade.
    const { error: deleteItemsError } = await supabase
      .from('package_items')
      .delete()
      .eq('package_id', item.id);

    if (deleteItemsError) {
      setError(
        `Could not delete package contents: ${deleteItemsError.message}`,
      );
      return;
    }

    const { error: deletePackageError } = await supabase
      .from('test_packages')
      .delete()
      .eq('id', item.id);

    if (deletePackageError) {
      setError(
        `Package contents were deleted, but the package could not be deleted: ${deletePackageError.message}`,
      );
      await loadData();
      return;
    }

    setPackages((current) =>
      current.filter((pkg) => pkg.id !== item.id),
    );

    setPackageItems((current) =>
      current.filter((entry) => entry.package_id !== item.id),
    );

    setMessage('Package deleted successfully.');
  }

  const activeCount = packages.filter((item) => item.is_active).length;
  const inactiveCount = packages.length - activeCount;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#079C83]">
            CATALOGUE MANAGEMENT
          </p>

          <h1 className="mt-1 text-2xl font-bold text-[#064568]">
            Manage Health Packages
          </h1>

          <p className="mt-1 text-sm text-[#64748B]">
            Create packages, group tests and manage package pricing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading || saving}
            className="inline-flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#17324D] hover:border-[#079C83] disabled:opacity-50"
          >
            <RefreshCw size={16} />
            Refresh
          </button>

          <button
            type="button"
            onClick={openNewForm}
            className="inline-flex items-center gap-2 rounded-lg bg-[#064568] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#079C83]"
          >
            <Plus size={17} />
            Add Package
          </button>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {message && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STATISTICS */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">Total packages</p>
          <p className="mt-2 text-2xl font-bold text-[#064568]">
            {packages.length}
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">Active packages</p>
          <p className="mt-2 text-2xl font-bold text-[#079C83]">
            {activeCount}
          </p>
        </div>

        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">Inactive packages</p>
          <p className="mt-2 text-2xl font-bold text-[#64748B]">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* SEARCH AND FILTER */}
      <div className="rounded-xl border border-[#E2E8F0] bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search package name or category..."
              className="w-full rounded-lg border border-[#E2E8F0] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#079C83]"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(
                event.target.value as 'all' | 'active' | 'inactive',
              )
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#17324D] outline-none focus:border-[#079C83]"
          >
            <option value="all">All packages</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
      </div>

      {/* PACKAGE LIST */}
      {loading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
          <RefreshCw
            size={25}
            className="mx-auto animate-spin text-[#079C83]"
          />
          <p className="mt-3 text-sm text-[#64748B]">
            Loading packages...
          </p>
        </div>
      ) : filteredPackages.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
          <Package size={32} className="mx-auto text-[#94A3B8]" />
          <p className="mt-3 font-semibold text-[#17324D]">
            No packages found
          </p>
          <p className="mt-1 text-sm text-[#64748B]">
            Try another search or create a new package.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#F6FAFB] text-xs uppercase tracking-wide text-[#64748B]">
                <tr>
                  <th className="px-5 py-4">Package</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Tests included</th>
                  <th className="px-5 py-4">Price</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredPackages.map((item) => {
                  const imageUrl = getImageUrl(item.image_path);

                  return (
                    <tr key={item.id} className="hover:bg-[#F8FBFC]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F1F7F8]">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.package_name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <Package
                                size={22}
                                className="text-[#079C83]"
                              />
                            )}
                          </div>

                          <div>
                            <p className="font-semibold text-[#17324D]">
                              {item.package_name}
                            </p>
                            <p className="mt-1 text-xs text-[#64748B]">
                              Order: {item.display_order}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[#64748B]">
                        {item.category}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-full bg-[#EAF7F4] px-3 py-1 text-xs font-semibold text-[#079C83]">
                          {itemCounts[item.id] ?? 0} items
                        </span>
                      </td>

                      <td className="px-5 py-4 font-bold text-[#064568]">
                        {formatPrice(item.price)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(item)}
                            title="Edit package"
                            className="rounded-lg border border-[#E2E8F0] p-2 text-[#064568] hover:border-[#079C83] hover:bg-[#EAF7F4]"
                          >
                            <Pencil size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => void togglePackageStatus(item)}
                            title={
                              item.is_active ? 'Deactivate' : 'Activate'
                            }
                            className="rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#17324D] hover:border-[#079C83]"
                          >
                            {item.is_active ? 'Hide' : 'Activate'}
                          </button>

                          <button
                            type="button"
                            onClick={() => void deletePackage(item)}
                            title="Delete package"
                            className="rounded-lg border border-red-100 p-2 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT PACKAGE FORM */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-3 sm:p-6">
          <div className="mx-auto my-4 max-w-4xl overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 sm:px-7">
              <div>
                <p className="text-xs font-semibold text-[#079C83]">
                  PACKAGE MANAGEMENT
                </p>

                <h2 className="mt-1 text-xl font-bold text-[#064568]">
                  {editingPackage ? 'Edit Package' : 'Create New Package'}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9]"
                aria-label="Close form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={savePackage} className="space-y-6 p-5 sm:p-7">
              {/* BASIC DETAILS */}
              <section>
                <h3 className="mb-4 font-bold text-[#17324D]">
                  Package Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#17324D]">
                      Package Name *
                    </label>
                    <input
                      required
                      value={form.packageName}
                      onChange={(event) =>
                        updateForm('packageName', event.target.value)
                      }
                      placeholder="e.g. Comprehensive Health Checkup"
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#17324D]">
                      Category *
                    </label>
                    <input
                      required
                      value={form.category}
                      onChange={(event) =>
                        updateForm('category', event.target.value)
                      }
                      placeholder="e.g. Fever, Preventive Health"
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#17324D]">
                      Package Price (₹) *
                    </label>
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateForm('price', event.target.value)
                      }
                      placeholder="e.g. 1499"
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-[#17324D]">
                      Display Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={form.displayOrder}
                      onChange={(event) =>
                        updateForm('displayOrder', event.target.value)
                      }
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-[#17324D]">
                      Description
                    </label>
                    <textarea
                      rows={3}
                      value={form.description}
                      onChange={(event) =>
                        updateForm('description', event.target.value)
                      }
                      placeholder="Describe what this package offers..."
                      className="w-full rounded-lg border border-[#E2E8F0] px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                    />
                  </div>
                </div>
              </section>

              {/* PACKAGE IMAGE */}
              <section>
                <h3 className="mb-3 font-bold text-[#17324D]">
                  Package Image
                </h3>

                <div className="rounded-xl border border-dashed border-[#CBD5E1] p-4">
                  {imagePreview ? (
                    <div className="flex flex-wrap items-center gap-4">
                      <img
                        src={imagePreview}
                        alt="Package preview"
                        className="h-24 w-24 rounded-lg border border-[#E2E8F0] object-cover"
                      />

                      <div>
                        <p className="text-sm font-semibold text-[#17324D]">
                          Image selected
                        </p>
                        <button
                          type="button"
                          onClick={() => handleImageChange(null)}
                          className="mt-2 text-xs font-semibold text-red-600 hover:underline"
                        >
                          Cancel new image selection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 text-[#64748B]">
                      <ImageIcon size={28} />
                      <div>
                        <p className="text-sm font-medium">
                          No image selected
                        </p>
                        <p className="mt-1 text-xs">
                          JPG, PNG or WebP. Maximum 5 MB.
                        </p>
                      </div>
                    </div>
                  )}

                  <label className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E2E8F0] px-4 py-2 text-sm font-semibold text-[#17324D] hover:border-[#079C83]">
                    <Upload size={16} />
                    Choose image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(event) =>
                        handleImageChange(
                          event.target.files?.[0] ?? null,
                        )
                      }
                    />
                  </label>
                </div>
              </section>

              {/* PACKAGE CONTENTS */}
              <section>
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-bold text-[#17324D]">
                      Tests Included *
                    </h3>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Select individual catalogue tests or add grouped
                      package entries.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={addTestItem}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#064568] px-3 py-2 text-xs font-semibold text-white hover:bg-[#079C83]"
                    >
                      <Plus size={15} />
                      Add Test
                    </button>

                    <button
                      type="button"
                      onClick={addCustomItem}
                      className="inline-flex items-center gap-2 rounded-lg border border-[#079C83] px-3 py-2 text-xs font-semibold text-[#079C83] hover:bg-[#EAF7F4]"
                    >
                      <Plus size={15} />
                      Add Grouped Item
                    </button>
                  </div>
                </div>

                {items.length === 0 ? (
                  <div className="mt-4 rounded-xl border border-dashed border-[#CBD5E1] py-10 text-center">
                    <FlaskConical
                      size={30}
                      className="mx-auto text-[#94A3B8]"
                    />
                    <p className="mt-3 text-sm font-semibold text-[#17324D]">
                      No package items added
                    </p>
                    <p className="mt-1 text-xs text-[#64748B]">
                      Add individual tests or grouped entries above.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {items.map((item, index) => (
                      <div
                        key={item.key}
                        className="rounded-xl border border-[#E2E8F0] bg-[#F8FBFC] p-3 sm:p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#EAF7F4] text-xs font-bold text-[#079C83]">
                              {index + 1}
                            </span>

                            <span className="text-sm font-semibold text-[#17324D]">
                              {item.kind === 'test'
                                ? 'Individual Test'
                                : 'Grouped / Custom Entry'}
                            </span>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => moveItem(index, -1)}
                              className="rounded p-1.5 text-[#64748B] hover:bg-white disabled:opacity-30"
                              aria-label="Move item up"
                            >
                              <ChevronUp size={17} />
                            </button>

                            <button
                              type="button"
                              disabled={index === items.length - 1}
                              onClick={() => moveItem(index, 1)}
                              className="rounded p-1.5 text-[#64748B] hover:bg-white disabled:opacity-30"
                              aria-label="Move item down"
                            >
                              <ChevronDown size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => removeItem(item.key)}
                              className="rounded p-1.5 text-red-600 hover:bg-red-50"
                              aria-label="Remove item"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        <div className="grid gap-3 sm:grid-cols-2">
                          <div>
                            <label className="mb-1 block text-xs font-medium text-[#64748B]">
                              Entry Type
                            </label>

                            <select
                              value={item.kind}
                              onChange={(event) =>
                                updateItem(item.key, {
                                  kind: event.target.value as
                                    | 'test'
                                    | 'custom',
                                  testId: '',
                                  displayName: '',
                                })
                              }
                              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                            >
                              <option value="test">
                                Existing catalogue test
                              </option>
                              <option value="custom">
                                Grouped / custom entry
                              </option>
                            </select>
                          </div>

                          {item.kind === 'test' && (
                            <div>
                              <label className="mb-1 block text-xs font-medium text-[#64748B]">
                                Select Test *
                              </label>

                              <select
                                value={item.testId}
                                onChange={(event) => {
                                  const selected = availableTests.find(
                                    (test) =>
                                      test.id === event.target.value,
                                  );

                                  updateItem(item.key, {
                                    testId: event.target.value,
                                    displayName:
                                      selected?.name ?? '',
                                  });
                                }}
                                className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                              >
                                <option value="">Select a test</option>
                                {availableTests.map((test) => (
                                  <option
                                    key={test.id}
                                    value={test.id}
                                  >
                                    {test.name}
                                    {!test.is_active ? ' (Inactive)' : ''}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          <div className="sm:col-span-2">
                            <label className="mb-1 block text-xs font-medium text-[#64748B]">
                              Website Display Name *
                            </label>

                            <input
                              required
                              value={item.displayName}
                              onChange={(event) =>
                                updateItem(item.key, {
                                  displayName: event.target.value,
                                })
                              }
                              placeholder={
                                item.kind === 'custom'
                                  ? 'e.g. Lipid Profile (7)'
                                  : 'Test display name'
                              }
                              className="w-full rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#079C83]"
                            />

                            <p className="mt-1 text-xs text-[#94A3B8]">
                              {item.kind === 'custom'
                                ? 'This is a grouped label. No duplicate test will be created.'
                                : 'This is the name shown inside the package.'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <p className="mt-3 text-xs text-[#64748B]">
                  Total package items: {items.length}
                </p>
              </section>

              {/* STATUS */}
              <section className="border-t border-[#E2E8F0] pt-5">
                <label className="flex items-center gap-2 text-sm font-medium text-[#17324D]">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(event) =>
                      updateForm('isActive', event.target.checked)
                    }
                    className="h-4 w-4 accent-[#079C83]"
                  />
                  Active on website
                </label>
              </section>

              {/* FORM ACTIONS */}
              <div className="flex flex-col-reverse gap-3 border-t border-[#E2E8F0] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="rounded-lg border border-[#E2E8F0] px-5 py-3 text-sm font-semibold text-[#17324D] hover:bg-[#F6FAFB] disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="rounded-lg bg-[#064568] px-6 py-3 text-sm font-semibold text-white hover:bg-[#079C83] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? uploading
                      ? 'Uploading image...'
                      : 'Saving...'
                    : editingPackage
                      ? 'Save Changes'
                      : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
