import React from 'react';
import { Hierarchy } from '../../types';

interface Props {
  hierarchy: Hierarchy;
  selectedDept: string;
  selectedSection: string;
  selectedTeam: string;
  onDepartmentChange: (deptId: string) => void;
  onSectionChange: (sectionId: string) => void;
  onTeamChange: (teamId: string) => void;
}

const HierarchySelector: React.FC<Props> = ({ hierarchy, selectedDept, selectedSection, selectedTeam, onDepartmentChange, onSectionChange, onTeamChange }) => {
  const deptEntries = Object.entries(hierarchy) as [string, Hierarchy[keyof Hierarchy]][];
  const sections = selectedDept ? Object.entries(hierarchy[selectedDept]?.sections || {}) as [string, any][] : [];
  const teams = (selectedDept && selectedSection) ? Object.entries(hierarchy[selectedDept]?.sections[selectedSection]?.teams || {}) as [string, any][] : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
        <select value={selectedDept} onChange={(e) => onDepartmentChange(e.target.value)} className="w-full border rounded px-2 py-2">
          <option value="">All</option>
          {deptEntries.map(([deptId, dept]) => (
            <option key={deptId} value={deptId}>{dept.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
        <select value={selectedSection} onChange={(e) => onSectionChange(e.target.value)} className="w-full border rounded px-2 py-2" disabled={!selectedDept}>
          <option value="">All</option>
          {sections.map(([sectionId, section]) => (
            <option key={sectionId} value={sectionId}>{section.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
        <select value={selectedTeam} onChange={(e) => onTeamChange(e.target.value)} className="w-full border rounded px-2 py-2" disabled={!selectedDept || !selectedSection}>
          <option value="">All</option>
          {teams.map(([teamId, team]) => (
            <option key={teamId} value={teamId}>{team.name}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default HierarchySelector;
