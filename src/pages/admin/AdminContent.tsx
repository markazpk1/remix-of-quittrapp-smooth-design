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
import { Pencil, Trash2, Plus, GripVertical, Star, Eye, Globe, Search } from "lucide-react";
import { toast } from "../../hooks/use-toast";
import { api } from "../../services/api";

interface BlogPost { id: string; title: string; status: string; date: string; views: number; author: string; category: string; }
interface FaqItem { id: string; question: string; answer: string; category: string; order: number; }
interface Testimonial { id: string; name: string; quote: string; rating: number; status: string; featured: boolean; }
interface SeoPage { path: string; title: string; description: string; indexed: boolean; }
interface Section { id: string; name: string; enabled: boolean; }

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
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string; onConfirm: () => void }>({ open: false, title: "", description: "", onConfirm: () => {} });

  useEffect(() => {
    fetchContentData();
  }, []);

  const fetchContentData = async () => {
    try {
      setLoading(true);
      const [sectionsRes, postsRes, faqsRes, testimonialsRes, seoRes] = await Promise.all([
        api.getContentSections(),
        api.getBlogPosts(),
        api.getFaqs(),
        api.getTestimonials(),
        api.getSeoPages(),
      ]);

      setSections(Array.isArray(sectionsRes) ? sectionsRes : []);
      setPosts(Array.isArray(postsRes) ? postsRes : []);
      setFaqs(Array.isArray(faqsRes) ? faqsRes : []);
      setTestimonials(Array.isArray(testimonialsRes) ? testimonialsRes : []);
      setSeoPages(Array.isArray(seoRes) ? seoRes : []);
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

  const toggleSection = (id: string) => {
    toast({ title: "Not Implemented", description: "Section toggle coming soon" });
  };

  const filteredPosts = posts.filter((p) => p.title.toLowerCase().includes(blogSearch.toLowerCase()) || p.category.toLowerCase().includes(blogSearch.toLowerCase()));

  const addPost = () => {
    toast({ title: "Not Implemented", description: "Blog post creation coming soon" });
    setAddPostOpen(false);
    setPostForm({ title: "", category: "Guide", author: "" });
  };

  const publishPost = (id: string) => {
    toast({ title: "Not Implemented", description: "Blog post publishing coming soon" });
  };

  const deletePost = (id: string) => {
    toast({ title: "Not Implemented", description: "Blog post deletion coming soon" });
  };

  const addFaq = () => {
    toast({ title: "Not Implemented", description: "FAQ creation coming soon" });
    setAddFaqOpen(false);
    setFaqForm({ question: "", answer: "", category: "Billing" });
  };

  const deleteFaq = (id: string) => {
    toast({ title: "Not Implemented", description: "FAQ deletion coming soon" });
  };

  const addTestimonial = () => {
    toast({ title: "Not Implemented", description: "Testimonial creation coming soon" });
    setAddTestimonialOpen(false);
    setTestimonialForm({ name: "", quote: "", rating: 5 });
  };

  const toggleFeatured = (id: string) => { 
    toast({ title: "Not Implemented", description: "Testimonial feature toggle coming soon" });
  };
  
  const approveTestimonial = (id: string) => { 
    toast({ title: "Not Implemented", description: "Testimonial approval coming soon" });
  };

  const deleteTestimonial = (id: string) => {
    toast({ title: "Not Implemented", description: "Testimonial deletion coming soon" });
  };

  const toggleIndexed = (path: string) => { 
    toast({ title: "Not Implemented", description: "SEO settings update coming soon" });
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
          <Card className="bg-card/60 border-border/40">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-foreground">Page Sections</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center justify-between py-3 px-3 rounded-lg bg-secondary/20 border border-border/20">
                      <div className="flex items-center gap-3">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                      <Skeleton className="w-12 h-6" />
                    </div>
                  ))}
                </div>
              ) : sections.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No sections found
                </div>
              ) : (
                sections.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-3 px-3 rounded-lg bg-secondary/20 border border-border/20">
                    <div className="flex items-center gap-3"><GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab" /><span className="text-sm text-foreground">{s.name}</span></div>
                    <Switch checked={s.enabled} onCheckedChange={() => toggleSection(s.id)} />
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
