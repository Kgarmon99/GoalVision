
import { useState } from 'react';
import { GoalTemplate } from '@shared/schema';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

interface GoalTemplatesProps {
  onApplyTemplate: (goals: any[]) => void;
}

export function GoalTemplates({ onApplyTemplate }: GoalTemplatesProps) {
  const [templates, setTemplates] = useState<GoalTemplate[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory]);

  const fetchTemplates = async () => {
    try {
      const url = selectedCategory === 'all' 
        ? '/api/goal-templates'
        : `/api/goal-templates/category/${selectedCategory}`;
      const response = await fetch(url);
      const data = await response.json();
      setTemplates(data);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['all', 'industry', 'best-practice', 'quick-start', 'custom'].map(category => (
          <Button 
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category)}
          >
            {category.replace('-', ' ').toUpperCase()}
          </Button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(template => (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{template.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">{template.description}</p>
              <Button onClick={() => onApplyTemplate(JSON.parse(template.goals))}>
                Apply Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
