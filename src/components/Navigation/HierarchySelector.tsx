import React from 'react';
import { Hierarchy } from '../../types';
import { cn } from '../../utils/cn';

interface HierarchySelectorProps {
  hierarchy: Hierarchy;
  selectedDept?: string;
  selectedSection?: string;
  selectedTeam?: string;
  onDepartmentChange: (deptId: string) => void;
  onSectionChange: (sectionId: string) => void;
  onTeamChange: (teamId: string) => void;
  className?: string;
}

const HierarchySelector: React.FC<HierarchySelectorProps> = ({
  hierarchy,
  selectedDept,
  selectedSection,
  selectedTeam,
  onDepartmentChange,
  onSectionChange,
  onTeamChange,
  className
}) => {
  const departments = Object.entries(hierarchy);
  const sections = selectedDept ? Object.entries(hierarchy[selectedDept]?.sections || {}) : [];
  const teams = selectedDept && selectedSection ? Object.entries(hierarchy[selectedDept]?.sections[selectedSection]?.teams || {}) : [];

  return (
    <div className={cn('space-y-4', className)}>
      {/* Department Selector */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📚 Department
        </label>
        <select
          value={selectedDept || ''}
          onChange={(e) => onDepartmentChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="">Select Department</option>
          {departments.map(([deptId, dept]) => (
            <option key={deptId} value={deptId}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      {/* Section Selector */}
      {selectedDept && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📂 Section
          </label>
          <select
            value={selectedSection || ''}
            onChange={(e) => onSectionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select Section</option>
            {sections.map(([sectionId, section]) => (
              <option key={sectionId} value={sectionId}>
                {section.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Team Selector */}
      {selectedSection && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            👥 Team
          </label>
          <select
            value={selectedTeam || ''}
            onChange={(e) => onTeamChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
          >
            <option value="">Select Team</option>
            {teams.map(([teamId, team]) => (
              <option key={teamId} value={teamId}>
                {team.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
};

export default HierarchySelector;