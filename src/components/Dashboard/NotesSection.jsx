// src/components/dashboard/NotesSection.jsx
import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Archive, Pin, Trash2, Edit2, 
  X, FileText, Download, Upload, Filter, Tag
} from 'lucide-react';
import { axiosPrivate as api } from '../../utils/axios';
import { useToast } from '../ui/toast/use-toast';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter 
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Badge } from '../ui/badge';
import NotesPDFDownload from './NotesPDFDownload';

const COLORS = [
  { name: 'blue', label: 'Bleu', bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700' },
  { name: 'yellow', label: 'Jaune', bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-700' },
  { name: 'green', label: 'Vert', bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700' },
  { name: 'red', label: 'Rouge', bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700' },
  { name: 'purple', label: 'Violet', bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700' },
  { name: 'pink', label: 'Rose', bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-700' },
  { name: 'gray', label: 'Gris', bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700' }
];

const NotesSection = () => {
  const { toast } = useToast();
  const [notes, setNotes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [colorFilter, setColorFilter] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, note: null });
  const [attachmentModal, setAttachmentModal] = useState({ isOpen: false, attachment: null });
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [],
    color: 'blue',
    is_pinned: false,
    files: []
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchNotes();
    fetchCategories();
  }, [searchTerm, categoryFilter, colorFilter, showArchived]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/notes', {
        params: {
          search: searchTerm || undefined,
          category: categoryFilter !== 'all' ? categoryFilter : undefined,
          color: colorFilter !== 'all' ? colorFilter : undefined,
          is_archived: showArchived
        }
      });
      setNotes(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des notes:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les notes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/notes/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
    }
  };

  const handleOpenModal = (note = null) => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content || '',
        category: note.category || '',
        tags: note.tags || [],
        color: note.color,
        is_pinned: note.is_pinned,
        files: []
      });
    } else {
      setFormData({
        title: '',
        content: '',
        category: '',
        tags: [],
        color: 'blue',
        is_pinned: false,
        files: []
      });
    }
    setModal({ isOpen: true, note });
  };

  const handleCloseModal = () => {
    setModal({ isOpen: false, note: null });
    setFormData({
      title: '',
      content: '',
      category: '',
      tags: [],
      color: 'blue',
      is_pinned: false,
      files: []
    });
    setTagInput('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('tags', JSON.stringify(formData.tags));
      formDataToSend.append('color', formData.color);
      formDataToSend.append('is_pinned', formData.is_pinned);

      // Ajouter les fichiers
      if (formData.files && formData.files.length > 0) {
        Array.from(formData.files).forEach((file) => {
          formDataToSend.append('files', file);
        });
      }

      if (modal.note) {
        await api.put(`/notes/${modal.note.id}`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Succès",
          description: "Note mise à jour avec succès"
        });
      } else {
        await api.post('/notes', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast({
          title: "Succès",
          description: "Note créée avec succès"
        });
      }

      handleCloseModal();
      fetchNotes();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la note:', error);
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder la note",
        variant: "destructive"
      });
    }
  };

  const handleTogglePin = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/pin`);
      fetchNotes();
      toast({
        title: "Succès",
        description: "Note mise à jour"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de modifier la note",
        variant: "destructive"
      });
    }
  };

  const handleToggleArchive = async (noteId) => {
    try {
      await api.patch(`/notes/${noteId}/archive`);
      fetchNotes();
      toast({
        title: "Succès",
        description: showArchived ? "Note désarchivée" : "Note archivée"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'archiver la note",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (noteId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
      return;
    }

    try {
      await api.delete(`/notes/${noteId}`);
      fetchNotes();
      toast({
        title: "Succès",
        description: "Note supprimée avec succès"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la note",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAttachment = async (noteId, attachmentId) => {
    try {
      await api.delete(`/notes/${noteId}/attachments/${attachmentId}`);
      fetchNotes();
      toast({
        title: "Succès",
        description: "Pièce jointe supprimée"
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la pièce jointe",
        variant: "destructive"
      });
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const getColorClasses = (colorName) => {
    const color = COLORS.find(c => c.name === colorName) || COLORS[0];
    return color;
  };

  return (
    <div className="space-y-4">
      {/* En-tête avec recherche et filtres */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h2 className="text-2xl font-bold">Notes</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filtre catégorie */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filtre couleur */}
          <Select value={colorFilter} onValueChange={setColorFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Couleur" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes</SelectItem>
              {COLORS.map(color => (
                <SelectItem key={color.name} value={color.name}>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${color.bg} ${color.border} border-2`} />
                    {color.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bouton archives */}
          <Button
            variant={showArchived ? "default" : "outline"}
            onClick={() => setShowArchived(!showArchived)}
          >
            <Archive className="h-4 w-4 mr-2" />
            {showArchived ? 'Actives' : 'Archives'}
          </Button>

          {/* Bouton télécharger PDF */}
          <NotesPDFDownload 
            notes={notes}
            filters={{
              search: searchTerm,
              category: categoryFilter,
              color: colorFilter,
              showArchived: showArchived
            }}
          />

          {/* Bouton nouvelle note */}
          <Button onClick={() => handleOpenModal()}>
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle note
          </Button>
        </div>
      </div>

      {/* Grille de notes style Trello */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : notes.length === 0 ? (
        <Card className="p-12 text-center">
          <p className="text-gray-500">
            {showArchived ? 'Aucune note archivée' : 'Aucune note. Créez votre première note !'}
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {notes.map(note => {
            const colorClass = getColorClasses(note.color);
            return (
              <Card
                key={note.id}
                className={`${colorClass.bg} ${colorClass.border} border-2 p-4 hover:shadow-lg transition-shadow cursor-pointer relative group`}
              >
                {/* Badge épinglé */}
                {note.is_pinned && (
                  <div className="absolute -top-2 -right-2 bg-yellow-400 rounded-full p-1">
                    <Pin className="h-3 w-3 text-yellow-900" />
                  </div>
                )}

                {/* Actions (visible au survol) */}
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleTogglePin(note.id)}
                  >
                    <Pin className={`h-3 w-3 ${note.is_pinned ? 'fill-current' : ''}`} />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleOpenModal(note)}
                  >
                    <Edit2 className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleToggleArchive(note.id)}
                  >
                    <Archive className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={() => handleDelete(note.id)}
                  >
                    <Trash2 className="h-3 w-3 text-red-600" />
                  </Button>
                </div>

                {/* Contenu de la note */}
                <div className="space-y-2">
                  <h3 className={`font-bold text-lg ${colorClass.text} pr-8`}>
                    {note.title}
                  </h3>

                  {note.content && (
                    <p className="text-sm text-gray-700 line-clamp-3">
                      {note.content}
                    </p>
                  )}

                  {/* Catégorie */}
                  {note.category && (
                    <Badge variant="secondary" className="text-xs">
                      {note.category}
                    </Badge>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          <Tag className="h-2 w-2 mr-1" />
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Pièces jointes */}
                  {note.attachments && note.attachments.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs text-gray-600 font-medium">
                        <FileText className="h-3 w-3" />
                        <span>{note.attachments.length} pièce(s) jointe(s):</span>
                      </div>
                      <div className="space-y-1 pl-4">
                        {note.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setAttachmentModal({ isOpen: true, attachment });
                            }}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            <FileText className="h-3 w-3" />
                            <span className="truncate max-w-[200px]">{attachment.file_name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Date de création */}
                  <p className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal d'ajout/modification */}
      <Dialog open={modal.isOpen} onOpenChange={handleCloseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modal.note ? 'Modifier la note' : 'Nouvelle note'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Titre */}
            <div>
              <label className="text-sm font-medium">Titre *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                placeholder="Titre de la note"
              />
            </div>

            {/* Contenu */}
            <div>
              <label className="text-sm font-medium">Contenu</label>
              <Textarea
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={6}
                placeholder="Contenu de la note..."
              />
            </div>

            {/* Catégorie et Couleur */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Catégorie</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="Ex: Important, Tâche..."
                  list="categories"
                />
                <datalist id="categories">
                  {categories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="text-sm font-medium">Couleur</label>
                <Select
                  value={formData.color}
                  onValueChange={(value) => setFormData({ ...formData, color: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map(color => (
                      <SelectItem key={color.name} value={color.name}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.bg} ${color.border} border-2`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="text-sm font-medium">Tags</label>
              <div className="flex gap-2 mb-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Ajouter un tag..."
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            {/* Pièces jointes */}
            <div>
              <label className="text-sm font-medium">Pièces jointes</label>
              <div className="mt-2">
                <Input
                  type="file"
                  multiple
                  onChange={(e) => setFormData({ ...formData, files: e.target.files })}
                  accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Max 5 fichiers, 2MB par fichier
                </p>
              </div>

              {/* Afficher les pièces jointes existantes */}
              {modal.note?.attachments && modal.note.attachments.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-sm font-medium">Pièces jointes actuelles:</p>
                  {modal.note.attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate max-w-[300px]">{attachment.file_name}</span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAttachment(modal.note.id, attachment.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Épingler */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_pinned"
                checked={formData.is_pinned}
                onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="is_pinned" className="text-sm cursor-pointer">
                Épingler cette note
              </label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseModal}>
                Annuler
              </Button>
              <Button type="submit">
                {modal.note ? 'Mettre à jour' : 'Créer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de visualisation des pièces jointes */}
      <Dialog open={attachmentModal.isOpen} onOpenChange={(open) => !open && setAttachmentModal({ isOpen: false, attachment: null })}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>{attachmentModal.attachment?.file_name}</span>
              <a
                href={`${process.env.NEXT_PUBLIC_URL || 'http://localhost:5000'}/${attachmentModal.attachment?.file_path.replace(/\\/g, '/').replace(/^public\//, '')}`}
                download={attachmentModal.attachment?.file_name}
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Download className="h-4 w-4" />
                Télécharger
              </a>
            </DialogTitle>
          </DialogHeader>

          <div className="overflow-auto max-h-[70vh]">
            {attachmentModal.attachment && (() => {
              const fileType = attachmentModal.attachment.file_type;
              // Construire le chemin correct - normaliser les slashes et enlever 'public/'
              const apiUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:5000';
              let cleanPath = attachmentModal.attachment.file_path
                .replace(/\\/g, '/') // Remplacer backslashes par slashes
                .replace(/^public\//, ''); // Enlever 'public/' au début
              const filePath = `${apiUrl}/${cleanPath}`;
              
              // Debug
              console.log('🔍 Debug attachment:', {
                original: attachmentModal.attachment.file_path,
                cleaned: cleanPath,
                final: filePath
              });

              // Images
              if (fileType?.startsWith('image/')) {
                return (
                  <img 
                    src={filePath} 
                    alt={attachmentModal.attachment.file_name}
                    className="w-full h-auto"
                    onError={(e) => {
                      console.error('Erreur de chargement de l\'image:', filePath);
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE2IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2Ugbm9uIGRpc3BvbmlibGU8L3RleHQ+PC9zdmc+';
                    }}
                  />
                );
              }

              // PDFs
              if (fileType === 'application/pdf') {
                return (
                  <div className="space-y-2">
                    <iframe
                      src={filePath}
                      className="w-full h-[600px] border-0"
                      title={attachmentModal.attachment.file_name}
                      onError={(e) => {
                        console.error('Erreur de chargement du PDF:', filePath);
                      }}
                    />
                    <p className="text-xs text-gray-500 text-center">
                      Si le PDF ne s'affiche pas, <a href={filePath} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">ouvrez-le dans un nouvel onglet</a>
                    </p>
                  </div>
                );
              }

              // Fichiers texte
              if (fileType?.startsWith('text/')) {
                return (
                  <iframe
                    src={filePath}
                    className="w-full h-[600px] border-0"
                    title={attachmentModal.attachment.file_name}
                  />
                );
              }

              // Autres types de fichiers
              return (
                <div className="flex flex-col items-center justify-center p-12 text-gray-500">
                  <FileText className="h-16 w-16 mb-4" />
                  <p className="text-lg mb-2">Aperçu non disponible pour ce type de fichier</p>
                  <p className="text-sm mb-4">{attachmentModal.attachment.file_name}</p>
                  <a
                    href={filePath}
                    download={attachmentModal.attachment.file_name}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    <Download className="h-4 w-4" />
                    Télécharger le fichier
                  </a>
                </div>
              );
            })()}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NotesSection;