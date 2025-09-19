import { useState, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  AtSign
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { useCandidatesStore } from '@/stores/candidates'
import { toast } from 'sonner'
import type { Candidate } from '@/types/candidate'

interface CandidateNotesProps {
  candidate: Candidate
}

// Mock users for @mentions - in a real app, this would come from an API
const MOCK_USERS = [
  { id: '1', name: 'John Smith', email: 'john@company.com', role: 'recruiter' },
  { id: '2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'hiring_manager' },
  { id: '3', name: 'Mike Chen', email: 'mike@company.com', role: 'admin' },
  { id: '4', name: 'Emily Davis', email: 'emily@company.com', role: 'recruiter' },
  { id: '5', name: 'David Wilson', email: 'david@company.com', role: 'hiring_manager' }
]

interface MentionSuggestion {
  id: string
  name: string
  email: string
  role: string
}

export function CandidateNotes({ candidate }: CandidateNotesProps) {
  const [newNote, setNewNote] = useState('')
  const [isAddingNote, setIsAddingNote] = useState(false)
  const [showMentions, setShowMentions] = useState(false)
  const [mentionQuery, setMentionQuery] = useState('')
  const [mentionPosition, setMentionPosition] = useState(0)
  const [filteredUsers, setFilteredUsers] = useState<MentionSuggestion[]>([])
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { addCandidateNote } = useCandidatesStore()

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const handleNoteChange = useCallback((value: string) => {
    setNewNote(value)
    
    // Check for @ mentions
    const cursorPosition = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = value.slice(0, cursorPosition)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)
    
    if (mentionMatch) {
      const query = mentionMatch[1].toLowerCase()
      setMentionQuery(query)
      setMentionPosition(cursorPosition - mentionMatch[0].length)
      
      // Filter users based on query
      const filtered = MOCK_USERS.filter(user =>
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
      ).slice(0, 5) // Limit to 5 suggestions
      
      setFilteredUsers(filtered)
      setShowMentions(filtered.length > 0)
      setSelectedMentionIndex(0)
    } else {
      setShowMentions(false)
      setMentionQuery('')
    }
  }, [])

  const insertMention = useCallback((user: MentionSuggestion) => {
    const beforeMention = newNote.slice(0, mentionPosition)
    const afterMention = newNote.slice(mentionPosition + mentionQuery.length + 1) // +1 for @
    const newText = `${beforeMention}@${user.name} ${afterMention}`
    
    setNewNote(newText)
    setShowMentions(false)
    setMentionQuery('')
    
    // Focus back to textarea
    setTimeout(() => {
      textareaRef.current?.focus()
      const newCursorPosition = mentionPosition + user.name.length + 2 // +2 for @ and space
      textareaRef.current?.setSelectionRange(newCursorPosition, newCursorPosition)
    }, 0)
  }, [newNote, mentionPosition, mentionQuery])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (showMentions && filteredUsers.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedMentionIndex(prev => 
            prev < filteredUsers.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedMentionIndex(prev => 
            prev > 0 ? prev - 1 : filteredUsers.length - 1
          )
          break
        case 'Enter':
        case 'Tab':
          e.preventDefault()
          insertMention(filteredUsers[selectedMentionIndex])
          break
        case 'Escape':
          setShowMentions(false)
          break
      }
    }
  }, [showMentions, filteredUsers, selectedMentionIndex, insertMention])

  const handleSubmit = async () => {
    if (!newNote.trim()) return

    try {
      setIsAddingNote(true)
      
      // Extract mentions from the note
      // const mentionMatches = newNote.match(/@(\w+(?:\s+\w+)*)/g) || []
      // const mentions = mentionMatches.map(match => match.slice(1)) // Remove @ symbol
      // TODO: Use mentions for API call when backend supports it
      
      await addCandidateNote(candidate.id, newNote.trim())
      setNewNote('')
      toast.success('Note added successfully')
    } catch (error) {
      toast.error('Failed to add note')
      console.error('Error adding note:', error)
    } finally {
      setIsAddingNote(false)
    }
  }

  const renderNoteContent = (content: string, mentions?: string[]) => {
    if (!mentions || mentions.length === 0) {
      return content
    }

    let renderedContent = content
    mentions.forEach(mention => {
      const mentionRegex = new RegExp(`@${mention}`, 'g')
      renderedContent = renderedContent.replace(
        mentionRegex,
        `<span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">@${mention}</span>`
      )
    })

    return <span dangerouslySetInnerHTML={{ __html: renderedContent }} />
  }

  const sortedNotes = [...(candidate.notes || [])].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5" />
          Notes ({candidate.notes?.length || 0})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Note Form */}
        <div className="space-y-3">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              placeholder="Add a note... Use @name to mention someone"
              value={newNote}
              onChange={(e) => handleNoteChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[80px] resize-none"
              disabled={isAddingNote}
            />
            
            {/* Mention Suggestions */}
            {showMentions && filteredUsers.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg max-h-48 overflow-y-auto">
                {filteredUsers.map((user, index) => (
                  <button
                    key={user.id}
                    className={`w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 ${
                      index === selectedMentionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
                    }`}
                    onClick={() => insertMention(user)}
                  >
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{user.name}</div>
                      <div className="text-xs text-gray-500 truncate">{user.email}</div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {user.role}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <AtSign className="h-3 w-3" />
              <span>Use @ to mention team members</span>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={!newNote.trim() || isAddingNote}
              size="sm"
            >
              {isAddingNote ? (
                <>Adding...</>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Add Note
                </>
              )}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Notes List */}
        {sortedNotes.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No notes yet</p>
            <p className="text-sm">Add the first note to start tracking candidate interactions</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedNotes.map((note) => (
              <div key={note.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarFallback className="text-xs">
                    {getInitials(note.authorName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {note.authorName}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {format(new Date(note.createdAt), 'MMM d, yyyy')}
                    </span>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {renderNoteContent(note.content, note.mentions)}
                  </div>
                  
                  {note.mentions && note.mentions.length > 0 && (
                    <div className="flex items-center gap-1 mt-2">
                      <AtSign className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500">
                        Mentioned: {note.mentions.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}