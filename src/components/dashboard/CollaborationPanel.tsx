"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Users, MessageSquare, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Annotation {
  id: number;
  documentId: number;
  userId: string;
  content: string;
  status: string;
  createdAt: string;
}

export const CollaborationPanel = () => {
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAnnotation, setNewAnnotation] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAnnotations();
  }, []);

  const fetchAnnotations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/collaboration?limit=20");
      if (!response.ok) throw new Error("Failed to fetch annotations");
      
      const data = await response.json();
      // API returns { success, queue, total } - extract queue array
      setAnnotations(data.queue || []);
    } catch (error) {
      console.error("Error fetching annotations:", error);
      toast.error("Failed to load collaboration data");
      setAnnotations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAnnotation = async () => {
    if (!newAnnotation.trim()) {
      toast.error("Please enter an annotation");
      return;
    }

    try {
      setSubmitting(true);
      
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "addAnnotation",
          documentId: 1,
          content: newAnnotation,
          userId: "analyst_1",
        }),
      });

      if (!response.ok) throw new Error("Failed to submit annotation");
      
      toast.success("Annotation added successfully");
      setNewAnnotation("");
      fetchAnnotations();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit annotation");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approveItem",
          itemId: id,
          reviewedBy: "analyst_1",
          comments: "Approved"
        }),
      });
      if (!response.ok) throw new Error("Failed to approve");
      
      toast.success("Annotation approved");
      fetchAnnotations();
    } catch (error) {
      toast.error("Failed to approve annotation");
    }
  };

  const handleReject = async (id: number) => {
    try {
      const response = await fetch("/api/collaboration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "rejectItem",
          itemId: id,
          reviewedBy: "analyst_1",
          comments: "Rejected"
        }),
      });
      if (!response.ok) throw new Error("Failed to reject");
      
      toast.success("Annotation rejected");
      fetchAnnotations();
    } catch (error) {
      toast.error("Failed to reject annotation");
    }
  };

  const stats = {
    total: annotations.length,
    pending: annotations.filter(a => a.status === "pending").length,
    approved: annotations.filter(a => a.status === "approved").length,
    rejected: annotations.filter(a => a.status === "rejected").length,
  };

  return (
    <Card className="border-teal-200 dark:border-teal-800 bg-gradient-to-br from-white to-teal-50 dark:from-slate-900 dark:to-teal-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          Collaboration & Human-in-the-Loop
        </CardTitle>
        <CardDescription>
          Team annotations, approvals, and feedback on AI findings
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold">{stats.total}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Total</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Pending</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Approved</div>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border text-center">
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">Rejected</div>
          </div>
        </div>

        {/* New Annotation */}
        <Card className="bg-white dark:bg-slate-900">
          <CardContent className="p-4 space-y-2">
            <h4 className="font-semibold text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Add Annotation
            </h4>
            <Textarea
              placeholder="Add your feedback or annotation here..."
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              rows={3}
            />
            <Button 
              onClick={handleSubmitAnnotation} 
              disabled={submitting || !newAnnotation.trim()}
              className="w-full"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Annotation"}
            </Button>
          </CardContent>
        </Card>

        {/* Annotations List */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        ) : annotations.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No annotations yet</p>
            <p className="text-xs mt-1">Be the first to add feedback!</p>
          </div>
        ) : (
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {annotations.map((annotation) => (
              <Card key={annotation.id} className="bg-white dark:bg-slate-900">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-teal-600" />
                      <Badge variant="outline">{annotation.userId}</Badge>
                    </div>
                    <Badge 
                      variant={
                        annotation.status === "approved" ? "default" : 
                        annotation.status === "rejected" ? "destructive" : 
                        "secondary"
                      }
                    >
                      {annotation.status}
                    </Badge>
                  </div>
                  
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    {annotation.content}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(annotation.createdAt).toLocaleString()}
                    </span>
                    
                    {annotation.status === "pending" && (
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleApprove(annotation.id)}
                        >
                          <CheckCircle className="h-3 w-3" />
                          Approve
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleReject(annotation.id)}
                        >
                          <XCircle className="h-3 w-3" />
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};