import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import ConfirmDialog from "../../components/admin/ConfirmDialog";
import { Pencil, Trash2, Plus, GripVertical, Star, Eye, Globe, Search, LayoutTemplate } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { api } from "../../services/api";
import GrapesJSBuilder from "../../components/admin/GrapesJSBuilder";
import ProfessionalLandingBuilder from "../../components/admin/ProfessionalLandingBuilder";
import { 
  fetchContentSectionsFromDatabase, 
  updateContentSection,
  updateContentSectionDetails,
  updateContentSectionOrder,
  fetchBlogPostsFromDatabase,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
  fetchFaqsFromDatabase,
  createFaq,
  deleteFaq as deleteFaqFromDb,
  fetchTestimonialsFromDatabase,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial as deleteTestimonialFromDb,
  fetchSeoPagesFromDatabase,
  updateSeoPage
} from "../../services/supabase";

interface BlogPost { id: string; title: string; status: string; date: string; views: number; author: string; category: string; }
interface FaqItem { id: string; question: string; answer: string; category: string; order: number; }
interface Testimonial { id: string; name: string; quote: string; rating: number; status: string; featured: boolean; }
interface SeoPage { path: string; title: string; description: string; indexed: boolean; }
interface Section { id: string; name: string; title?: string; subtitle?: string; content?: string; enabled: boolean; }

export default function AdminContent() {
  const [sections, setSections] = useState<Section[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [seoPages, setSeoPages] = useState<SeoPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [blogSearch, setBlogSearch] = useState("");
  const [addPostOpen, setAddPostOpen] = useState(false);
  const [addFaqOpen, setAddFaqOpen] = useState(false);
  const [addTestimonialOpen, setAddTestimonialOpen] = useState(false);
  const [postForm, setPostForm] = useState({ title: "", category: "Guide", author: "" });
  const [faqForm, setFaqForm] = useState({ question: "", answer: "", category: "Billing" });
  const [testimonialForm, setTestimonialForm] = useState({ name: "", quote: "", rating: 5 });
  const [sectionEditOpen, setSectionEditOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [sectionForm, setSectionForm] = useState({ title: "", subtitle: "", content: "" });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });
  const [uploadedTemplate, setUploadedTemplate] = useState<{ html: string; css: string } | null>(null);
  const [grapesKey, setGrapesKey] = useState(0);

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      
      // Fetch data from database (fallback to mock API if tables don't exist)
      let sectionsRes, postsRes, faqsRes, testimonialsRes, seoRes;
      
      try {
        sectionsRes = await fetchContentSectionsFromDatabase();
      } catch (error) {
        console.log('Content sections database not available, falling back to mock API');
        sectionsRes = await api.getContentSections();
      }
      
      try {
        postsRes = await fetchBlogPostsFromDatabase();
      } catch (error) {
        console.log('Blog posts database not available, falling back to mock API');
        postsRes = await api.getBlogPosts();
      }
      
      try {
        faqsRes = await fetchFaqsFromDatabase();
      } catch (error) {
        console.log('FAQs database not available, falling back to mock API');
        faqsRes = await api.getFaqs();
      }
      
      try {
        testimonialsRes = await fetchTestimonialsFromDatabase();
      } catch (error) {
        console.log('Testimonials database not available, falling back to mock API');
        testimonialsRes = await api.getTestimonials();
      }
      
      try {
        seoRes = await fetchSeoPagesFromDatabase();
      } catch (error) {
        console.log('SEO pages database not available, falling back to mock API');
        seoRes = await api.getSeoPages();
      }

      // Transform data to match interfaces
      const transformedSections = (sectionsRes.data || []).map((item: any) => ({
        id: item.id,
        name: item.name || 'Untitled',
        title: item.title || '',
        subtitle: item.subtitle || '',
        content: item.content || '',
        enabled: item.enabled !== false
      }));

      // If no sections in DB and current local sections is empty, use defaults
      if (transformedSections.length === 0 && sections.length === 0) {
        const defaultSections = [
          { id: 'hero-1', name: 'Hero', enabled: true },
          { id: 'stats-1', name: 'Stats', enabled: true },
          { id: 'how-1', name: 'How It Works', enabled: true },
          { id: 'creators-1', name: 'Creators', enabled: true },
          { id: 'testimonials-1', name: 'Testimonials', enabled: true },
          { id: 'features-1', name: 'Features Grid', enabled: true },
          { id: 'pricing-1', name: 'Pricing', enabled: true },
          { id: 'faq-1', name: 'FAQ', enabled: true }
        ];
        setSections(defaultSections as any);
      } else if (transformedSections.length > 0) {
        // Remove any exact duplicates by name if they somehow slipped in
        const uniqueSections = transformedSections.filter((v, i, a) => a.findIndex(t => t.name === v.name) === i);
        setSections(uniqueSections);
      }

      const transformedPosts = (postsRes.data || []).map((item: any) => ({
        id: item.id,
        title: item.title || 'Untitled',
        status: item.status || 'draft',
        date: new Date(item.created_at || item.date).toLocaleDateString(),
        views: item.views || 0,
        author: item.author || 'Unknown',
        category: item.category || 'Guide'
      }));

      const transformedFaqs = (faqsRes.data || []).map((item: any) => ({
        id: item.id,
        question: item.question || 'No question',
        answer: item.answer || 'No answer',
        category: item.category || 'General',
        order: item.order_index || 0
      }));

      const transformedTestimonials = (testimonialsRes.data || []).map((item: any) => ({
        id: item.id,
        name: item.name || 'Anonymous',
        quote: item.quote || '',
        rating: item.rating || 5,
        status: item.status || 'pending',
        featured: item.featured || false
      }));

      const transformedSeoPages = (seoRes.data || []).map((item: any) => ({
        path: item.path || '/',
        title: item.title || 'Untitled',
        description: item.description || '',
        indexed: item.indexed !== false
      }));

      setSections(transformedSections);
      setPosts(transformedPosts);
      setFaqs(transformedFaqs);
      setTestimonials(transformedTestimonials);
      setSeoPages(transformedSeoPages);
    } catch (error) {
      console.error('Failed to fetch content data:', error);
      toast({ title: "Error", description: "Failed to load content data" });
      // Set empty arrays to prevent filter errors
      setSections([]);
      setPosts([]);
      setFaqs([]);
      setTestimonials([]);
      setSeoPages([]);
    } finally {
      setLoading(false);
    }
  };

  const editSection = (section: Section) => {
    setEditingSection(section);
    setSectionForm({
      title: section.title || '',
      subtitle: section.subtitle || '',
      content: section.content || ''
    });
    setSectionEditOpen(true);
  };

  const saveSectionEdit = async () => {
    if (!editingSection) return;
    
    try {
      const updateData = {
        title: sectionForm.title.trim(),
        subtitle: sectionForm.subtitle.trim(),
        content: sectionForm.content.trim()
      };

      const result = await updateContentSectionDetails(editingSection.id, updateData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Section updated successfully" });
      setSectionEditOpen(false);
      setEditingSection(null);
      
      // Refresh the sections list
      await fetchContentData();
    } catch (error) {
      console.error('Save section edit error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update section", variant: "destructive" });
    }
  };

  const toggleSection = async (id: string) => {
    const section = sections.find(s => s.id === id);
    if (!section) return;
    
    try {
      const result = await updateContentSection(id, !section.enabled);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      // Update local state
      setSections(prev => prev.map(s => 
        s.id === id ? { ...s, enabled: !s.enabled } : s
      ));
      
      toast({ title: "Success", description: `Section ${section.enabled ? 'disabled' : 'enabled'} successfully` });
    } catch (error) {
      console.error('Toggle section error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to toggle section", variant: "destructive" });
    }
  };

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        // Simple extraction of CSS from <style> tags if they exist
        let html = content;
        let css = "";
        
        const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
        if (styleMatch) {
          css = styleMatch[1];
          html = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
        }

        // Strip body/html tags if they exist as GrapesJS likes component fragments
        const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
        if (bodyMatch) {
          html = bodyMatch[1];
        }

        setUploadedTemplate({ html, css });
        setGrapesKey(prev => prev + 1); // Force GrapesJS to re-initialize
        toast({ title: "Template Loaded", description: "Your HTML file has been imported into the editor." });
      }
    };
    reader.readAsText(file);
  };

  const filteredPosts = posts.filter((p) => p.title.toLowerCase().includes(blogSearch.toLowerCase()) || p.category.toLowerCase().includes(blogSearch.toLowerCase()));

  const addPost = async () => {
    if (!postForm.title.trim() || !postForm.category || !postForm.author.trim()) {
      toast({ title: "Error", description: "Title, category, and author are required", variant: "destructive" });
      return;
    }

    try {
      const postData = {
        title: postForm.title.trim(),
        category: postForm.category,
        author: postForm.author.trim(),
        status: 'draft'
      };

      const result = await createBlogPost(postData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Blog post created successfully" });
      setAddPostOpen(false);
      setPostForm({ title: "", category: "Guide", author: "" });
      
      // Refresh the posts list
      await fetchContentData();
    } catch (error) {
      console.error('Add post error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to create blog post", variant: "destructive" });
    }
  };

  const publishPost = async (id: string) => {
    try {
      const result = await updateBlogPost(id, { status: 'published' });
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === id ? { ...post, status: 'published' } : post
      ));
      
      toast({ title: "Success", description: "Blog post published successfully" });
    } catch (error) {
      console.error('Publish post error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to publish blog post", variant: "destructive" });
    }
  };

  const deletePost = async (id: string) => {
    const post = posts.find(p => p.id === id);
    if (!post) return;
    
    setConfirm({
      open: true,
      title: `Delete "${post.title}"?`,
      description: "This will permanently delete the blog post. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const result = await deleteBlogPost(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          // Remove from local state
          setPosts(prev => prev.filter(p => p.id !== id));
          toast({ title: "Success", description: "Blog post deleted successfully" });
        } catch (error) {
          console.error('Delete post error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete blog post", variant: "destructive" });
        }
      }
    });
  };

  const addFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim() || !faqForm.category.trim()) {
      toast({ title: "Error", description: "Question, answer, and category are required", variant: "destructive" });
      return;
    }

    try {
      const faqData = {
        question: faqForm.question.trim(),
        answer: faqForm.answer.trim(),
        category: faqForm.category.trim()
      };

      const result = await createFaq(faqData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "FAQ added successfully" });
      setAddFaqOpen(false);
      setFaqForm({ question: "", answer: "", category: "Billing" });
      
      // Refresh the FAQs list
      await fetchContentData();
    } catch (error) {
      console.error('Add FAQ error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to add FAQ", variant: "destructive" });
    }
  };

  const deleteFaq = (id: string) => {
    const faq = faqs.find(f => f.id === id);
    if (!faq) return;
    
    setConfirm({
      open: true,
      title: `Delete FAQ?`,
      description: "This will permanently delete the FAQ. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const result = await deleteFaqFromDb(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          // Remove from local state
          setFaqs(prev => prev.filter(f => f.id !== id));
          toast({ title: "Success", description: "FAQ deleted successfully" });
        } catch (error) {
          console.error('Delete FAQ error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete FAQ", variant: "destructive" });
        }
      }
    });
  };

  const addTestimonial = async () => {
    if (!testimonialForm.name.trim() || !testimonialForm.quote.trim()) {
      toast({ title: "Error", description: "Name and quote are required", variant: "destructive" });
      return;
    }

    try {
      const testimonialData = {
        name: testimonialForm.name.trim(),
        quote: testimonialForm.quote.trim(),
        rating: testimonialForm.rating
      };

      const result = await createTestimonial(testimonialData);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      toast({ title: "Success", description: "Testimonial added successfully" });
      setAddTestimonialOpen(false);
      setTestimonialForm({ name: "", quote: "", rating: 5 });
      
      // Refresh the testimonials list
      await fetchContentData();
    } catch (error) {
      console.error('Add testimonial error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to add testimonial", variant: "destructive" });
    }
  };

  const toggleFeatured = async (id: string) => { 
    const testimonial = testimonials.find(t => t.id === id);
    if (!testimonial) return;
    
    try {
      const result = await updateTestimonial(id, { featured: !testimonial.featured });
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      setTestimonials(prev => prev.map(t => 
        t.id === id ? { ...t, featured: !t.featured } : t
      ));
      
      toast({ title: "Success", description: `Testimonial ${testimonial.featured ? 'unfeatured' : 'featured'} successfully` });
    } catch (error) {
      console.error('Toggle featured error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to toggle testimonial featured status", variant: "destructive" });
    }
  };
  
  const approveTestimonial = async (id: string) => { 
    try {
      const result = await updateTestimonial(id, { status: 'approved' });
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      setTestimonials(prev => prev.map(t => 
        t.id === id ? { ...t, status: 'approved' } : t
      ));
      
      toast({ title: "Success", description: "Testimonial approved successfully" });
    } catch (error) {
      console.error('Approve testimonial error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to approve testimonial", variant: "destructive" });
    }
  };

  const deleteTestimonial = (id: string) => {
    const testimonial = testimonials.find(t => t.id === id);
    if (!testimonial) return;
    
    setConfirm({
      open: true,
      title: `Delete testimonial from "${testimonial.name}"?`,
      description: "This will permanently delete the testimonial. This action cannot be undone.",
      onConfirm: async () => {
        try {
          const result = await deleteTestimonialFromDb(id);
          
          if (!result.success) {
            throw new Error(result.message);
          }
          
          // Remove from local state
          setTestimonials(prev => prev.filter(t => t.id !== id));
          toast({ title: "Success", description: "Testimonial deleted successfully" });
        } catch (error) {
          console.error('Delete testimonial error:', error);
          toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete testimonial", variant: "destructive" });
        }
      }
    });
  };

  const toggleIndexed = async (path: string) => { 
    try {
      const seoPage = seoPages.find(p => p.path === path);
      if (!seoPage) return;
      
      const result = await updateSeoPage(path, !seoPage.indexed);
      
      if (!result.success) {
        throw new Error(result.message);
      }

      // Update local state
      setSeoPages(prev => prev.map(p => 
        p.path === path ? { ...p, indexed: !p.indexed } : p
      ));
      
      toast({ title: "Success", description: `SEO indexing ${seoPage.indexed ? 'disabled' : 'enabled'} for ${path}` });
    } catch (error) {
      console.error('Toggle indexed error:', error);
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to update SEO settings", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <ConfirmDialog open={confirm.open} onOpenChange={(open) => setConfirm((c) => ({ ...c, open }))} title={confirm.title} description={confirm.description} onConfirm={confirm.onConfirm} confirmLabel="Delete" />

      <div><h1 className="font-display text-2xl font-bold text-foreground">Content</h1><p className="text-sm text-muted-foreground">Manage landing page, blog, FAQs, testimonials, and SEO.</p></div>

      <Tabs defaultValue="landing" className="space-y-4">
        <TabsList className="bg-secondary/40 border border-border/30 flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="landing">Landing Page</TabsTrigger><TabsTrigger value="blog">Blog Posts</TabsTrigger><TabsTrigger value="faq">FAQs</TabsTrigger><TabsTrigger value="testimonials">Testimonials</TabsTrigger><TabsTrigger value="seo">SEO</TabsTrigger>
        </TabsList>

        <TabsContent value="landing" className="space-y-4">
          <Tabs defaultValue="visual" className="w-full">
            <TabsList className="bg-secondary/20 mb-4">
              <TabsTrigger value="visual" className="text-xs">Visual Page Builder</TabsTrigger>
              <TabsTrigger value="grapes" className="text-xs">GrapesJS (HTML/CSS)</TabsTrigger>
              <TabsTrigger value="list" className="text-xs">Section List</TabsTrigger>
            </TabsList>
            
            <TabsContent value="visual" className="space-y-4">
              <ProfessionalLandingBuilder 
                initialSections={sections.map(s => ({
                  id: s.id,
                  type: s.name.toLowerCase().replace(/\s+/g, '-'),
                  label: s.name,
                  enabled: s.enabled,
                  content: {
                    title: s.title,
                    subtitle: s.subtitle,
                    // Parse content if it's JSON, otherwise treat as raw
                    ...(s.content && s.content.startsWith('{') ? JSON.parse(s.content) : { rawContent: s.content })
                  }
                }))}
                onSave={async (updatedSections) => {
                  try {
                    // Update order and details for all sections
                    await updateContentSectionOrder(updatedSections.map((s, index) => ({
                      id: s.id,
                      name: s.label,
                      order_index: index
                    })));

                    // Update details for each section
                    for (const s of updatedSections) {
                      await updateContentSectionDetails(s.id, {
                        title: s.content.title || '',
                        subtitle: s.content.subtitle || '',
                        enabled: s.enabled,
                        // If it's not a special section, we can store other content fields
                        content: s.content.rawContent || (Object.keys(s.content).length > 2 ? JSON.stringify(s.content) : '')
                      });
                    }

                    toast({ title: "Success", description: "Landing page updated successfully" });
                    await fetchContentData();
                  } catch (error) {
                    console.error("Save builder error:", error);
                    toast({ title: "Error", description: "Failed to save changes", variant: "destructive" });
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="grapes" className="space-y-4">
              <div className="flex justify-end mb-2">
                <input 
                  type="file" 
                  id="template-upload" 
                  accept=".html,.htm" 
                  className="hidden" 
                  onChange={handleTemplateUpload}
                />
                <Button variant="outline" size="sm" onClick={() => document.getElementById('template-upload')?.click()}>
                  <LayoutTemplate size={14} className="mr-2" />
                  Upload HTML Template
                </Button>
              </div>
              <GrapesJSBuilder
                key={grapesKey}
                initialHtml={uploadedTemplate?.html}
                initialCss={uploadedTemplate?.css}
                onSave={async (html, css) => {
                  try {
                    await updateContentSectionDetails('Landing Page', {
                      content: JSON.stringify({ html, css }),
                      name: 'Landing Page'
                    });
                    toast({ title: "Success", description: "GrapesJS content saved" });
                    await fetchContentData();
                  } catch (error) {
                    toast({ title: "Error", description: "Failed to save GrapesJS content", variant: "destructive" });
                  }
                }}
              />
            </TabsContent>

            <TabsContent value="list" className="space-y-4">
              <Card className="bg-card/60 border-border/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Manage Individual Sections</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => fetchContentData()}>
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/20">
                    {sections.map((section) => (
                      <div key={section.id} className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <GripVertical className="w-4 h-4 text-muted-foreground/30" />
                          <div>
                            <div className="text-sm font-medium text-foreground">{section.name}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{section.id}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Switch 
                            checked={section.enabled} 
                            onCheckedChange={() => toggleSection(section.id)} 
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => editSection(section)}>
                            <Pencil className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

      {/* Section Edit Dialog */}
      <Dialog open={sectionEditOpen} onOpenChange={setSectionEditOpen}>
        <DialogContent className="bg-card border-border/40 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground">
              Edit {editingSection?.name || 'Section'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input 
                value={sectionForm.title} 
                onChange={(e) => setSectionForm({ ...sectionForm, title: e.target.value })} 
                placeholder="Section title" 
                className="bg-secondary/40 border-border/30" 
              />
            </div>
            <div className="space-y-2">
              <Label>Subtitle</Label>
              <Input 
                value={sectionForm.subtitle} 
                onChange={(e) => setSectionForm({ ...sectionForm, subtitle: e.target.value })} 
                placeholder="Section subtitle" 
                className="bg-secondary/40 border-border/30" 
              />
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea 
                value={sectionForm.content} 
                onChange={(e) => setSectionForm({ ...sectionForm, content: e.target.value })} 
                placeholder="Section content" 
                rows={4}
                className="bg-secondary/40 border-border/30" 
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={saveSectionEdit}>Save Changes</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

        <TabsContent value="blog" className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-64"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input placeholder="Search posts..." value={blogSearch} onChange={(e) => setBlogSearch(e.target.value)} className="pl-9 bg-secondary/40 border-border/30 text-sm" /></div>
            <Dialog open={addPostOpen} onOpenChange={setAddPostOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> New Post</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40 max-w-lg">
                <DialogHeader><DialogTitle className="text-foreground">Create Blog Post</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Title</Label><Input value={postForm.title} onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} placeholder="Post title" className="bg-secondary/40 border-border/30" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2"><Label>Category</Label>
                      <Select value={postForm.category} onValueChange={(v) => setPostForm({ ...postForm, category: v })}>
                        <SelectTrigger className="bg-secondary/40 border-border/30"><SelectValue /></SelectTrigger>
                        <SelectContent className="bg-card border-border/40"><SelectItem value="Guide">Guide</SelectItem><SelectItem value="Tips">Tips</SelectItem><SelectItem value="Science">Science</SelectItem><SelectItem value="Research">Research</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2"><Label>Author</Label><Input value={postForm.author} onChange={(e) => setPostForm({ ...postForm, author: e.target.value })} placeholder="Author name" className="bg-secondary/40 border-border/30" /></div>
                  </div>
                  <Button onClick={addPost} className="w-full">Save Draft</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="bg-card/60 border-border/40">
            <CardContent className="p-0">
              <div className="divide-y divide-border/20">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center justify-between p-4 border-b border-border/20">
                        <div className="flex-1">
                          <Skeleton className="h-5 w-48 mb-2" />
                          <Skeleton className="h-4 w-32 mb-1" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-16" />
                          <Skeleton className="h-8 w-8" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : posts.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No blog posts found
                  </div>
                ) : (
                  filteredPosts.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">{p.title}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30">{p.category}</Badge>
                          <span className="text-xs text-muted-foreground">by {p.author}</span>
                          <span className="text-xs text-muted-foreground">· {p.date}</span>
                          {p.views > 0 && <span className="text-xs text-muted-foreground">· <Eye className="w-3 h-3 inline" /> {p.views.toLocaleString()}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] capitalize ${p.status === "published" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{p.status}</Badge>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => publishPost(p.id)}><Pencil className="w-3.5 h-3.5 text-muted-foreground" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deletePost(p.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faq" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={addFaqOpen} onOpenChange={setAddFaqOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> New FAQ</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader><DialogTitle className="text-foreground">Add FAQ</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Question</Label><Input value={faqForm.question} onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })} placeholder="Question" className="bg-secondary/40 border-border/30" /></div>
                  <div className="space-y-2"><Label>Answer</Label><Textarea value={faqForm.answer} onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })} placeholder="Answer" className="bg-secondary/40 border-border/30" /></div>
                  <div className="space-y-2"><Label>Category</Label><Input value={faqForm.category} onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })} placeholder="e.g. Billing" className="bg-secondary/40 border-border/30" /></div>
                  <Button onClick={addFaq} className="w-full">Add FAQ</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border-b border-border/20">
                    <Skeleton className="h-5 w-48 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : faqs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No FAQs found
              </div>
            ) : (
              faqs.map((f) => (
                <Card key={f.id} className="bg-card/60 border-border/40">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground mb-1">{f.question}</div>
                          <div className="text-xs text-muted-foreground">{f.answer}</div>
                          <Badge variant="outline" className="text-[9px] bg-secondary text-muted-foreground border-border/30 mt-2">{f.category}</Badge>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteFaq(f.id)}><Trash2 className="w-3.5 h-3.5 text-red-400" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="testimonials" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={addTestimonialOpen} onOpenChange={setAddTestimonialOpen}>
              <DialogTrigger asChild><Button className="bg-primary text-primary-foreground"><Plus className="w-4 h-4 mr-2" /> Add Testimonial</Button></DialogTrigger>
              <DialogContent className="bg-card border-border/40">
                <DialogHeader><DialogTitle className="text-foreground">Add Testimonial</DialogTitle></DialogHeader>
                <div className="space-y-4 pt-2">
                  <div className="space-y-2"><Label>Name</Label><Input value={testimonialForm.name} onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })} placeholder="User name" className="bg-secondary/40 border-border/30" /></div>
                  <div className="space-y-2"><Label>Quote</Label><Textarea value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} placeholder="Their testimonial" className="bg-secondary/40 border-border/30" /></div>
                  <Button onClick={addTestimonial} className="w-full">Add Testimonial</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 border border-border/20 rounded-lg">
                    <div className="flex items-start gap-3">
                      <Skeleton className="w-10 h-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-full mb-1" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : testimonials.length === 0 ? (
              <div className="col-span-2 text-center text-muted-foreground py-8">
                No testimonials found
              </div>
            ) : (
              testimonials.map((t) => (
                <Card key={t.id} className={`bg-card/60 border-border/40 ${t.featured ? "ring-1 ring-primary/20" : ""}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">{t.name.split(" ").map((n) => n[0]).join("")}</div>
                        <div>
                          <div className="text-sm font-medium text-foreground">{t.name}</div>
                          <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < t.rating ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`} />))}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {t.featured && <Badge variant="outline" className="text-[9px] bg-primary/20 text-primary border-primary/30">Featured</Badge>}
                        <Badge variant="outline" className={`text-[10px] capitalize ${t.status === "published" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"}`}>{t.status}</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">"{t.quote}"</p>
                    <div className="flex gap-1 mt-3 justify-end">
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => toggleFeatured(t.id)}><Star className="w-3 h-3 mr-1" /> {t.featured ? "Unfeature" : "Feature"}</Button>
                      {t.status === "pending" && <Button variant="ghost" size="sm" className="text-xs h-7 text-green-400" onClick={() => approveTestimonial(t.id)}>Approve</Button>}
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteTestimonial(t.id)}><Trash2 className="w-3 h-3 text-red-400" /></Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="seo" className="space-y-4">
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-foreground">Page SEO Settings</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="p-4 border border-border/20 rounded-lg">
                      <Skeleton className="h-5 w-48 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-32" />
                    </div>
                  ))}
                </div>
              ) : seoPages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No SEO pages found
                </div>
              ) : (
                seoPages.map((page) => (
                  <div key={page.path} className="py-3 px-3 rounded-lg bg-secondary/20 border border-border/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2"><Globe className="w-3.5 h-3.5 text-muted-foreground" /><code className="text-xs text-primary font-mono">{page.path}</code></div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-muted-foreground">Indexed</span>
                        <Switch checked={page.indexed} onCheckedChange={() => toggleIndexed(page.path)} />
                      </div>
                    </div>
                    <div className="text-sm text-foreground font-medium">{page.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{page.description}</div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card className="bg-card/60 border-border/40">
            <CardHeader><CardTitle className="text-sm font-medium text-foreground">Global SEO</CardTitle></CardHeader>
            <CardContent className="space-y-4 max-w-xl">
              <div className="space-y-2"><Label>Google Site Verification</Label><Input placeholder="Verification code" className="bg-secondary/40 border-border/30" /></div>
              <div className="space-y-2"><Label>Robots.txt</Label><Textarea defaultValue={"User-agent: *\nAllow: /\nDisallow: /admin"} rows={4} className="bg-secondary/40 border-border/30 font-mono text-xs" /></div>
              <Button onClick={() => toast({ title: "SEO Settings Saved" })}>Save SEO Settings</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
