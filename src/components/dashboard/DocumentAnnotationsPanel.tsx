"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessageSquare, Plus, Trash2, Edit2, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Annotation {
  id: string;
  documentId: number;
  documentName: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
}

interface DocumentAnnotationsPanelProps {
  companyId: string;
}

export const DocumentAnnotationsPanel = ({ companyId }: DocumentAnnotationsPanelProps) => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<Annotation | null>(null);
  const [formData, setFormData] = useState({
    documentId: "",
    content: "",
    category: "observation",
    author: "Current User"
  });

  useEffect(() => {
    fetchData();
  }, [companyId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch documents
      const docsRes = await fetch(`/api/documents?companyId=${companyId}`);
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDocuments(docsData);
      }

      // Load annotations from localStorage (or you could create an API)
      const storedAnnotations = localStorage.getItem(`annotations_${companyId}`);
      if (storedAnnotations) {
        setAnnotations(JSON.parse(storedAnnotations));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAnnotations = (newAnnotations: Annotation[]) => {
    localStorage.setItem(`annotations_${companyId}`, JSON.stringify(newAnnotations));
    setAnnotations(newAnnotations);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.documentId || !formData.content) {
      toast.error("Please fill in all required fields");
      return;
    }

    const selectedDoc = documents.find(d => d.id === parseInt(formData.documentId));
    
    if (editingAnnotation) {
      const updated = annotations.map(a =>
        a.id === editingAnnotation.id
          ? { 
              ...a, 
              content: formData.content, 
              category: formData.category,
              documentId: parseInt(formData.documentId),
              documentName: selectedDoc?.fileName || ""
            }
          : a
      );
      saveAnnotations(updated);
      toast.success("Annotation updated successfully");
    } else {
      const newAnnotation: Annotation = {
        id: Date.now().toString(),
        documentId: parseInt(formData.documentId),
        documentName: selectedDoc?.fileName || "",
        content: formData.content,
        category: formData.category,
        author: formData.author,
        createdAt: new Date().toISOString()
      };
      saveAnnotations([...annotations, newAnnotation]);
      toast.success("Annotation added successfully");
    }

    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this annotation?")) return;

    const filtered = annotations.filter(a => a.id !== id);
    saveAnnotations(filtered);
    toast.success("Annotation deleted");
  };

  const handleEdit = (annotation: Annotation) => {
    setEditingAnnotation(annotation);
    setFormData({
      documentId: annotation.documentId.toString(),
      content: annotation.content,
      category: annotation.category,
      author: annotation.author
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingAnnotation(null);
    setFormData({
      documentId: "",
      content: "",
      category: "observation",
      author: "Current User"
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      observation: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      issue: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
      recommendation: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      question: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
      note: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
    };
    return colors[category] || colors.note;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6 flex items-center justify-center min-h-[200px]">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-indigo-600" />
            Document Annotations
            <Badge variant="outline">{annotations.length} notes</Badge>
          </CardTitle>

          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingAnnotation ? "Edit Annotation" : "Add Annotation"}</DialogTitle>
                <DialogDescription>
                  Add notes, observations, or questions about documents
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="documentId">Document</Label>
                  <Select
                    value={formData.documentId}
                    onValueChange={(value) => setFormData({ ...formData, documentId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent>
                      {documents.map((doc) => (
                        <SelectItem key={doc.id} value={doc.id.toString()}>
                          {doc.fileName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="observation">Observation</SelectItem>
                      <SelectItem value="issue">Issue</SelectItem>
                      <SelectItem value="recommendation">Recommendation</SelectItem>
                      <SelectItem value="question">Question</SelectItem>
                      <SelectItem value="note">Note</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Enter your annotation..."
                    rows={5}
                    required
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingAnnotation ? "Update" : "Add"} Annotation
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {annotations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">No annotations yet</p>
            <p className="text-xs text-gray-400 mt-1">Add notes to track insights and observations</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[500px] overflow-y-auto">
            {annotations.map((annotation) => (
              <div
                key={annotation.id}
                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-indigo-600" />
                    <span className="text-sm font-medium">{annotation.documentName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(annotation)}
                    >
                      <Edit2 className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleDelete(annotation.id)}
                    >
                      <Trash2 className="h-3 w-3 text-red-500" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {annotation.content}
                </p>

                <div className="flex items-center justify-between">
                  <Badge className={getCategoryColor(annotation.category)}>
                    {annotation.category}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {new Date(annotation.createdAt).toLocaleDateString()} • {annotation.author}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
