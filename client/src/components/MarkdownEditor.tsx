import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bold, Italic, Heading, Link2, Image, List, ListOrdered, 
  Code, Quote, Eye, Edit3 
} from "lucide-react";
import { ObjectUploader } from "@/components/ObjectUploader";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UploadResult } from "@uppy/core";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const { toast } = useToast();

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = document.querySelector('[data-testid="textarea-markdown-editor"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = before + textToInsert + after;
    
    const newValue = value.substring(0, start) + newText + value.substring(end);
    onChange(newValue);

    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + textToInsert.length);
    }, 0);
  };

  const getUploadParameters = async () => {
    const response = await apiRequest("POST", "/api/objects/upload");
    const data = await response.json();
    return {
      method: "PUT" as const,
      url: data.uploadURL,
    };
  };

  const handleImageUploadComplete = async (result: UploadResult<Record<string, unknown>, Record<string, unknown>>) => {
    try {
      if (result.successful && result.successful[0]) {
        const uploadURL = result.successful[0].uploadURL;
        
        // Set the image path in the backend
        const response = await apiRequest("PUT", "/api/post-images", {
          imageURL: uploadURL
        });
        const data = await response.json();
        
        // Insert markdown image syntax
        const imageMarkdown = `![Image](${data.objectPath})`;
        insertMarkdown(imageMarkdown);
        
        toast({
          title: "Image uploaded",
          description: "Image has been uploaded and inserted into the post.",
        });
      }
    } catch (error) {
      console.error("Error handling image upload:", error);
      toast({
        title: "Upload error",
        description: "Failed to process uploaded image.",
        variant: "destructive",
      });
    }
  };

  const toolbarButtons = [
    { icon: Bold, action: () => insertMarkdown("**", "**", "bold text"), tooltip: "Bold" },
    { icon: Italic, action: () => insertMarkdown("*", "*", "italic text"), tooltip: "Italic" },
    { icon: Heading, action: () => insertMarkdown("## ", "", "Heading"), tooltip: "Heading" },
    { icon: Link2, action: () => insertMarkdown("[", "](url)", "link text"), tooltip: "Link" },
    { icon: List, action: () => insertMarkdown("- ", "", "list item"), tooltip: "Bulleted List" },
    { icon: ListOrdered, action: () => insertMarkdown("1. ", "", "list item"), tooltip: "Numbered List" },
    { icon: Code, action: () => insertMarkdown("`", "`", "code"), tooltip: "Inline Code" },
    { icon: Quote, action: () => insertMarkdown("> ", "", "blockquote"), tooltip: "Quote" },
  ];

  const renderMarkdownPreview = (markdown: string) => {
    // Simple markdown rendering for preview
    let html = markdown
      .replace(/^### (.+)/gm, '<h3>$1</h3>')
      .replace(/^## (.+)/gm, '<h2>$1</h2>')
      .replace(/^# (.+)/gm, '<h1>$1</h1>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/`(.+?)`/g, '<code>$1</code>')
      .replace(/^> (.+)/gm, '<blockquote>$1</blockquote>')
      .replace(/^\- (.+)/gm, '<li>$1</li>')
      .replace(/^(\d+)\. (.+)/gm, '<li>$2</li>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" />')
      .replace(/\n/g, '<br />');

    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');

    return html;
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={(tab) => setActiveTab(tab as "edit" | "preview")}>
        <div className="flex items-center justify-between bg-muted px-4 py-2 border-b">
          <div className="flex items-center space-x-2">
            {toolbarButtons.map((button, index) => {
              const Icon = button.icon;
              return (
                <Button
                  key={index}
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={button.action}
                  className="h-8 w-8 p-0"
                  title={button.tooltip}
                  data-testid={`button-${button.tooltip.toLowerCase().replace(" ", "-")}`}
                >
                  <Icon className="h-4 w-4" />
                </Button>
              );
            })}
            <div className="h-4 w-px bg-border mx-2" />
            <ObjectUploader
              maxNumberOfFiles={1}
              maxFileSize={5 * 1024 * 1024} // 5MB
              onGetUploadParameters={getUploadParameters}
              onComplete={handleImageUploadComplete}
              buttonClassName="h-8 w-8 p-0"
            >
              <Image className="h-4 w-4" />
            </ObjectUploader>
          </div>
          
          <TabsList className="grid w-48 grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center">
              <Edit3 className="h-4 w-4 mr-2" />
              Edit
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your post content in Markdown..."
            className="min-h-[400px] border-0 resize-none focus-visible:ring-0 font-mono text-sm"
            data-testid="textarea-markdown-editor"
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className="min-h-[400px] p-4 prose prose-sm max-w-none markdown-content"
            dangerouslySetInnerHTML={{ __html: renderMarkdownPreview(value) }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
