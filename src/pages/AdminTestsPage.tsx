
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import {
  Search,
  Plus,
  Pencil,
  RefreshCw,
  Upload,
  X,
  FlaskConical,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface TestRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  mrp: number | null;
  selling_price: number;
  discount_percent: number | null;
  report_turnaround_hours: number | null;
  sample_type: string | null;
  prep_instructions: string | null;
  image_path: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
}

interface Category {
  id: string;
  name: string;
}

interface TestCategoryLink {
  test_id: string;
  category_id: string;
}

interface TestForm {
  name: string;
  description: string;
  mrp: string;
  sellingPrice: string;
  sampleType: string;
  turnaroundHours: string;
  prepInstructions: string;
  categoryIds: string[];
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: string;
}

const emptyForm: TestForm = {
  name: '',
  description: '',
  mrp: '',
  sellingPrice: '',
  sampleType: '',
  turnaroundHours: '',
  prepInstructions: '',
  categoryIds: [],
  isFeatured: false,
  isActive: true,
  displayOrder: '0',
};

const BUCKET_NAME = 'catalogue-images';

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getImageUrl(path: string | null) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}

function formatPrice(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString('en-IN');
}

export function AdminTestsPage() {

  const [tests, setTests] = useState<TestRecord[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [testCategoryLinks, setTestCategoryLinks] = useState<TestCategoryLink[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showForm, setShowForm] = useState(false);
  const [editingTest, setEditingTest] = useState<TestRecord | null>(null);
  const [form, setForm] = useState<TestForm>(emptyForm);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function loadData() {
    setLoading(true);
    setError('');

    const [testsResult, categoriesResult, linksResult] = await Promise.all([
      supabase
        .from('tests')
        .select(
          'id, name, slug, description, mrp, selling_price, discount_percent, report_turnaround_hours, sample_type, prep_instructions, image_path, is_featured, is_active, display_order'
        )
        .order('display_order', { ascending: true })
        .order('name', { ascending: true }),

      supabase
        .from('categories')
        .select('id, name')
        .eq('is_active', true)
        .order('display_order', { ascending: true }),

      supabase
        .from('test_categories')
        .select('test_id, category_id'),
    ]);

    if (testsResult.error || categoriesResult.error || linksResult.error) {
      setError(
        testsResult.error?.message ||
          categoriesResult.error?.message ||
          linksResult.error?.message ||
          'Unable to load catalogue data.'
      );
    } else {
      setTests((testsResult.data ?? []) as TestRecord[]);
      setCategories((categoriesResult.data ?? []) as Category[]);
      setTestCategoryLinks((linksResult.data ?? []) as TestCategoryLink[]);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadData();
  }, []);

  const filteredTests = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return tests.filter((test) => {
      const matchesSearch =
        !normalizedSearch ||
        test.name.toLowerCase().includes(normalizedSearch) ||
        test.slug.toLowerCase().includes(normalizedSearch);

      const matchesFilter =
        filter === 'all' ||
        (filter === 'active' && test.is_active) ||
        (filter === 'inactive' && !test.is_active);

      return matchesSearch && matchesFilter;
    });
  }, [tests, search, filter]);

  function getCategoryNames(testId: string) {
    const categoryIds = testCategoryLinks
      .filter((link) => link.test_id === testId)
      .map((link) => link.category_id);

    return categories
      .filter((category) => categoryIds.includes(category.id))
      .map((category) => category.name);
  }

  function openNewForm() {
    setEditingTest(null);
    setForm(emptyForm);
    setSelectedImage(null);
    setImagePreview(null);
    setMessage('');
    setError('');
    setShowForm(true);
  }

  function openEditForm(test: TestRecord) {
    const categoryIds = testCategoryLinks
      .filter((link) => link.test_id === test.id)
      .map((link) => link.category_id);

    setEditingTest(test);
    setForm({
      name: test.name,
      description: test.description ?? '',
      mrp: test.mrp == null ? '' : String(test.mrp),
      sellingPrice: String(test.selling_price),
      sampleType: test.sample_type ?? '',
      turnaroundHours:
        test.report_turnaround_hours == null
          ? ''
          : String(test.report_turnaround_hours),
      prepInstructions: test.prep_instructions ?? '',
      categoryIds,
      isFeatured: test.is_featured,
      isActive: test.is_active,
      displayOrder: String(test.display_order ?? 0),
    });

    setSelectedImage(null);
    setImagePreview(getImageUrl(test.image_path));
    setMessage('');
    setError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingTest(null);
    setSelectedImage(null);
    setImagePreview(null);
    setForm(emptyForm);
  }

  function updateForm<K extends keyof TestForm>(key: K, value: TestForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function handleImageChange(file: File | null) {
    setError('');
    setSelectedImage(file);

    if (!file) {
      setImagePreview(editingTest ? getImageUrl(editingTest.image_path) : null);
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setSelectedImage(null);
      setImagePreview(editingTest ? getImageUrl(editingTest.image_path) : null);
      setError('Please select a JPG, PNG or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setSelectedImage(null);
      setImagePreview(editingTest ? getImageUrl(editingTest.image_path) : null);
      setError('Image size must be 5 MB or less.');
      return;
    }

    setImagePreview(URL.createObjectURL(file));
  }

  async function uploadTestImage(testId: string) {
    if (!selectedImage) return null;

    setUploading(true);

    const extension = selectedImage.name.split('.').pop()?.toLowerCase() || 'jpg';
    const imagePath = `tests/${testId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(imagePath, selectedImage, {
        cacheControl: '3600',
        upsert: false,
        contentType: selectedImage.type,
      });

    setUploading(false);

    if (uploadError) {
      throw new Error(`Image upload failed: ${uploadError.message}`);
    }

    return imagePath;
  }

  async function saveTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setMessage('');

    const name = form.name.trim();
    const sellingPrice = Number(form.sellingPrice);
    const mrp = form.mrp.trim() === '' ? null : Number(form.mrp);
    const turnaroundHours =
      form.turnaroundHours.trim() === ''
        ? null
        : Number(form.turnaroundHours);

    if (!name) {
      setError('Please enter the test name.');
      return;
    }

    if (form.sellingPrice.trim() === '' || !Number.isFinite(sellingPrice) || sellingPrice < 0) {
      setError('Please enter a valid selling price.');
      return;
    }

    if (mrp !== null && (!Number.isFinite(mrp) || mrp < 0)) {
      setError('Please enter a valid MRP.');
      return;
    }

    if (mrp !== null && mrp > 0 && sellingPrice > mrp) {
      setError('Selling price cannot be greater than MRP.');
      return;
    }

    if (
      turnaroundHours !== null &&
      (!Number.isInteger(turnaroundHours) || turnaroundHours < 0)
    ) {
      setError('Turnaround time must be a whole number of hours.');
      return;
    }

    const displayOrder = Number(form.displayOrder);

    if (!Number.isInteger(displayOrder) || displayOrder < 0) {
      setError('Display order must be a whole number of zero or more.');
      return;
    }

    setSaving(true);

    try {
      const discountPercent =
        mrp !== null && mrp > 0
          ? Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100))
          : null;

      const testPayload = {
        name,
        slug: editingTest?.name === name
          ? editingTest.slug
          : `${slugify(name)}-${Date.now().toString().slice(-6)}`,
        description: form.description.trim() || null,
        mrp,
        selling_price: sellingPrice,
        discount_percent: discountPercent,
        sample_type: form.sampleType.trim() || null,
        report_turnaround_hours: turnaroundHours,
        prep_instructions: form.prepInstructions.trim() || null,
        is_featured: form.isFeatured,
        is_active: form.isActive,
        display_order: displayOrder,
      };

      let savedTestId = editingTest?.id;

      if (editingTest) {
        const { error: updateError } = await supabase
          .from('tests')
          .update(testPayload)
          .eq('id', editingTest.id);

        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase
          .from('tests')
          .insert(testPayload)
          .select('id')
          .single();

        if (insertError) throw insertError;
        savedTestId = data.id;
      }

      if (!savedTestId) {
        throw new Error('The test was saved, but its ID could not be retrieved.');
      }

      // Update the category assignments for this test.
      const { error: deleteLinksError } = await supabase
        .from('test_categories')
        .delete()
        .eq('test_id', savedTestId);

      if (deleteLinksError) {
        throw new Error(`Test saved, but categories could not be updated: ${deleteLinksError.message}`);
      }

      if (form.categoryIds.length > 0) {
        const categoryRows = form.categoryIds.map((categoryId) => ({
          test_id: savedTestId,
          category_id: categoryId,
        }));

        const { error: categoryError } = await supabase
          .from('test_categories')
          .insert(categoryRows);

        if (categoryError) {
          throw new Error(`Test saved, but categories could not be assigned: ${categoryError.message}`);
        }
      }

      // Upload an optional image and save its storage path.
      if (selectedImage) {
        const imagePath = await uploadTestImage(savedTestId);

        if (imagePath) {
          const { error: imageUpdateError } = await supabase
            .from('tests')
            .update({ image_path: imagePath })
            .eq('id', savedTestId);

          if (imageUpdateError) {
            throw new Error(`Test saved, but image path could not be updated: ${imageUpdateError.message}`);
          }
        }
      }

      closeForm();
      setMessage(editingTest ? 'Test updated successfully.' : 'New test added successfully.');
      await loadData();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : 'Unable to save the test.'
      );
    } finally {
      setSaving(false);
      setUploading(false);
    }
  }

  async function toggleTestStatus(test: TestRecord) {
    const nextStatus = !test.is_active;
    const confirmed = window.confirm(
      `${nextStatus ? 'Activate' : 'Deactivate'} "${test.name}"?`
    );

    if (!confirmed) return;

    setError('');
    setMessage('');

    const { error: updateError } = await supabase
      .from('tests')
      .update({ is_active: nextStatus })
      .eq('id', test.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setTests((current) =>
      current.map((item) =>
        item.id === test.id ? { ...item, is_active: nextStatus } : item
      )
    );

    setMessage(
      nextStatus ? 'Test activated successfully.' : 'Test deactivated successfully.'
    );
  }

  const activeCount = tests.filter((test) => test.is_active).length;
  const inactiveCount = tests.length - activeCount;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-semibold text-[#079C83]">
            CATALOGUE MANAGEMENT
          </p>
          <h1 className="mt-1 text-2xl font-bold text-[#064568]">
            Manage Diagnostic Tests
          </h1>
          <p className="mt-1 text-sm text-[#64748B]">
            Add, edit, price and manage your diagnostic test catalogue.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
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
            Add New Test
          </button>
        </div>
      </div>

      {message && (
        <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          {message}
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">Total tests</p>
          <p className="mt-2 text-2xl font-bold text-[#064568]">{tests.length}</p>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">Active tests</p>
          <p className="mt-2 text-2xl font-bold text-[#079C83]">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-[#E2E8F0] bg-white p-5">
          <p className="text-sm text-[#64748B]">Inactive tests</p>
          <p className="mt-2 text-2xl font-bold text-[#64748B]">{inactiveCount}</p>
        </div>
      </div>

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
              placeholder="Search by test name..."
              className="w-full rounded-lg border border-[#E2E8F0] py-2.5 pl-10 pr-3 text-sm outline-none focus:border-[#079C83]"
            />
          </div>

          <select
            value={filter}
            onChange={(event) =>
              setFilter(event.target.value as 'all' | 'active' | 'inactive')
            }
            className="rounded-lg border border-[#E2E8F0] bg-white px-3 py-2.5 text-sm text-[#17324D] outline-none focus:border-[#079C83]"
          >
            <option value="all">All tests</option>
            <option value="active">Active only</option>
            <option value="inactive">Inactive only</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
          <RefreshCw size={25} className="mx-auto animate-spin text-[#079C83]" />
          <p className="mt-3 text-sm text-[#64748B]">Loading test catalogue...</p>
        </div>
      ) : filteredTests.length === 0 ? (
        <div className="rounded-xl border border-[#E2E8F0] bg-white py-16 text-center">
          <FlaskConical size={30} className="mx-auto text-[#94A3B8]" />
          <p className="mt-3 font-semibold text-[#17324D]">No tests found</p>
          <p className="mt-1 text-sm text-[#64748B]">
            Try another search or add a new test.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-[#E2E8F0] bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-[#F6FAFB] text-xs uppercase tracking-wide text-[#64748B]">
                <tr>
                  <th className="px-5 py-4">Test</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">MRP</th>
                  <th className="px-5 py-4">Selling price</th>
                  <th className="px-5 py-4">Sample</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredTests.map((test) => {
                  const imageUrl = getImageUrl(test.image_path);
                  const categoryNames = getCategoryNames(test.id);

                  return (
                    <tr key={test.id} className="hover:bg-[#F8FBFC]">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#F1F7F8]">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={test.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <FlaskConical size={19} className="text-[#079C83]" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-[#17324D]">{test.name}</p>
                            {test.is_featured && (
                              <span className="mt-1 inline-block text-[11px] font-semibold text-[#079C83]">
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[#64748B]">
                        {categoryNames.length > 0
                          ? categoryNames.join(', ')
                          : 'Unassigned'}
                      </td>

                      <td className="px-5 py-4 text-[#64748B]">
                        {test.mrp == null ? '—' : `₹${formatPrice(test.mrp)}`}
                      </td>

                      <td className="px-5 py-4 font-semibold text-[#064568]">
                        ₹{formatPrice(test.selling_price)}
                      </td>

                      <td className="px-5 py-4 text-[#64748B]">
                        {test.sample_type || '—'}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            test.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {test.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditForm(test)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] px-3 py-2 text-xs font-semibold text-[#17324D] hover:border-[#079C83] hover:text-[#079C83]"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => void toggleTestStatus(test)}
                            className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                              test.is_active
                                ? 'bg-red-50 text-red-700 hover:bg-red-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {test.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-[#E2E8F0] px-5 py-3 text-xs text-[#64748B]">
            Showing {filteredTests.length} of {tests.length} tests
          </div>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-[#17324D]/50 px-3 py-6 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4 sm:px-7">
              <div>
                <h2 className="text-xl font-bold text-[#064568]">
                  {editingTest ? 'Edit Diagnostic Test' : 'Add New Diagnostic Test'}
                </h2>
                <p className="mt-1 text-xs text-[#64748B]">
                  Enter the test details below.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={saving}
                className="rounded-lg p-2 text-[#64748B] hover:bg-[#F1F5F9]"
                aria-label="Close form"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={saveTest} className="space-y-6 p-5 sm:p-7">
              {error && (
                <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Test name *
                  </label>
                  <input
                    required
                    value={form.name}
                    onChange={(event) => updateForm('name', event.target.value)}
                    placeholder="Example: Complete Blood Count"
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={form.description}
                    onChange={(event) => updateForm('description', event.target.value)}
                    placeholder="Short description of this diagnostic test"
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    MRP (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.mrp}
                    onChange={(event) => updateForm('mrp', event.target.value)}
                    placeholder="Enter MRP"
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Selling price (₹) *
                  </label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.sellingPrice}
                    onChange={(event) => updateForm('sellingPrice', event.target.value)}
                    placeholder="Enter selling price"
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Sample type
                  </label>
                  <input
                    value={form.sampleType}
                    onChange={(event) => updateForm('sampleType', event.target.value)}
                    placeholder="Example: SERUM, EDTA, URINE"
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Turnaround time (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.turnaroundHours}
                    onChange={(event) => updateForm('turnaroundHours', event.target.value)}
                    placeholder="Example: 24"
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                  <p className="mt-1 text-xs text-[#64748B]">
                    Enter the number of hours. Leave blank if not confirmed.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Preparation instructions
                  </label>
                  <textarea
                    rows={3}
                    value={form.prepInstructions}
                    onChange={(event) => updateForm('prepInstructions', event.target.value)}
                    placeholder="Example: Fasting required for 10–12 hours."
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Categories
                  </label>

                  {categories.length === 0 ? (
                    <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                      No active categories were found. Add or activate categories before assigning them to tests.
                    </p>
                  ) : (
                    <div className="grid gap-2 rounded-lg border border-[#E2E8F0] p-4 sm:grid-cols-2">
                      {categories.map((category) => (
                        <label
                          key={category.id}
                          className="flex items-center gap-2 text-sm text-[#17324D]"
                        >
                          <input
                            type="checkbox"
                            checked={form.categoryIds.includes(category.id)}
                            onChange={(event) => {
                              const nextIds = event.target.checked
                                ? [...form.categoryIds, category.id]
                                : form.categoryIds.filter((id) => id !== category.id);

                              updateForm('categoryIds', nextIds);
                            }}
                            className="h-4 w-4 accent-[#079C83]"
                          />
                          {category.name}
                        </label>
                      ))}
                    </div>
                  )}
                  <p className="mt-1 text-xs text-[#64748B]">
                    You can assign more than one category to a test.
                  </p>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Display order
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.displayOrder}
                    onChange={(event) => updateForm('displayOrder', event.target.value)}
                    className="w-full rounded-lg border border-[#E2E8F0] px-4 py-3 text-sm outline-none focus:border-[#079C83]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-[#17324D]">
                    Test image
                  </label>

                  <div className="rounded-xl border border-dashed border-[#CBD5E1] p-4">
                    {imagePreview ? (
                      <div className="flex flex-wrap items-center gap-4">
                        <img
                          src={imagePreview}
                          alt="Test preview"
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
                            Remove selected image
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3 text-[#64748B]">
                        <ImageIcon size={28} />
                        <div>
                          <p className="text-sm font-medium">No image selected</p>
                          <p className="mt-1 text-xs">JPG, PNG or WebP. Maximum 5 MB.</p>
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
                          handleImageChange(event.target.files?.[0] ?? null)
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="sm:col-span-2 flex flex-wrap gap-5">
                  <label className="flex items-center gap-2 text-sm font-medium text-[#17324D]">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) => updateForm('isFeatured', event.target.checked)}
                      className="h-4 w-4 accent-[#079C83]"
                    />
                    Featured test
                  </label>

                  <label className="flex items-center gap-2 text-sm font-medium text-[#17324D]">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(event) => updateForm('isActive', event.target.checked)}
                      className="h-4 w-4 accent-[#079C83]"
                    />
                    Active on website
                  </label>
                </div>
              </div>

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
                    : editingTest
                      ? 'Save Changes'
                      : 'Add Test'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
