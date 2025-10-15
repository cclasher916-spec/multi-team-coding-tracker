import { 
  collection, 
  getDocs, 
  query, 
  orderBy, 
  Firestore,
  DocumentData
} from 'firebase/firestore';
import { DailyTotal, Hierarchy } from '../types';

export class FirebaseService {
  private db: Firestore;

  constructor(db: Firestore) {
    this.db = db;
  }

  /**
   * Load the complete hierarchy (departments -> sections -> teams)
   */
  async loadHierarchy(): Promise<Hierarchy> {
    try {
      const hierarchy: Hierarchy = {};
      
      // Get all departments
      const departmentsSnapshot = await getDocs(collection(this.db, 'departments'));
      
      for (const deptDoc of departmentsSnapshot.docs) {
        const deptId = deptDoc.id;
        const deptData = deptDoc.data();
        
        hierarchy[deptId] = {
          id: deptId,
          name: deptData.name || deptId,
          sections: {}
        };
        
        // Get sections in this department
        const sectionsSnapshot = await getDocs(
          collection(this.db, 'departments', deptId, 'sections')
        );
        
        for (const sectionDoc of sectionsSnapshot.docs) {
          const sectionId = sectionDoc.id;
          const sectionData = sectionDoc.data();
          
          hierarchy[deptId].sections[sectionId] = {
            id: sectionId,
            name: sectionData.name || sectionId,
            deptId,
            teams: {}
          };
          
          // Get teams in this section
          const teamsSnapshot = await getDocs(
            collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams')
          );
          
          for (const teamDoc of teamsSnapshot.docs) {
            const teamId = teamDoc.id;
            const teamData = teamDoc.data();
            
            hierarchy[deptId].sections[sectionId].teams[teamId] = {
              id: teamId,
              name: teamData.name || teamId,
              description: teamData.description || '',
              sectionId,
              deptId
            };
          }
        }
      }
      
      return hierarchy;
    } catch (error) {
      console.error('Error loading hierarchy:', error);
      throw error;
    }
  }

  /**
   * Load data for a specific team
   */
  async loadTeamData(deptId: string, sectionId: string, teamId: string): Promise<DailyTotal[]> {
    try {
      const rows: DailyTotal[] = [];
      
      // Get team reference
      const teamRef = collection(
        this.db, 
        'departments', deptId, 
        'sections', sectionId, 
        'teams', teamId, 
        'members'
      );
      
      // Get all members
      const membersSnapshot = await getDocs(teamRef);
      
      for (const memberDoc of membersSnapshot.docs) {
        const memberId = memberDoc.id;
        const memberData = memberDoc.data();
        
        // Get daily totals for this member
        const dailyTotalsSnapshot = await getDocs(
          query(
            collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams', teamId, 'members', memberId, 'daily_totals'),
            orderBy('date', 'desc')
          )
        );
        
        dailyTotalsSnapshot.docs.forEach(dailyDoc => {
          const dailyData = dailyDoc.data();
          rows.push(this.transformDailyData(dailyData, memberData, memberId, teamId, sectionId, deptId));
        });
      }
      
      return rows;
    } catch (error) {
      console.error('Error loading team data:', error);
      throw error;
    }
  }

  /**
   * Load data for all teams in a section
   */
  async loadSectionData(deptId: string, sectionId: string): Promise<DailyTotal[]> {
    try {
      const allData: DailyTotal[] = [];
      
      // Get all teams in section
      const teamsSnapshot = await getDocs(
        collection(this.db, 'departments', deptId, 'sections', sectionId, 'teams')
      );
      
      for (const teamDoc of teamsSnapshot.docs) {
        const teamId = teamDoc.id;
        const teamData = await this.loadTeamData(deptId, sectionId, teamId);
        allData.push(...teamData);
      }
      
      return allData;
    } catch (error) {
      console.error('Error loading section data:', error);
      throw error;
    }
  }

  /**
   * Load data for entire department
   */
  async loadDepartmentData(deptId: string): Promise<DailyTotal[]> {
    try {
      const allData: DailyTotal[] = [];
      
      // Get all sections in department
      const sectionsSnapshot = await getDocs(
        collection(this.db, 'departments', deptId, 'sections')
      );
      
      for (const sectionDoc of sectionsSnapshot.docs) {
        const sectionId = sectionDoc.id;
        const sectionData = await this.loadSectionData(deptId, sectionId);
        allData.push(...sectionData);
      }
      
      return allData;
    } catch (error) {
      console.error('Error loading department data:', error);
      throw error;
    }
  }

  /**
   * Load data for all departments
   */
  async loadAllDepartmentsData(): Promise<DailyTotal[]> {
    try {
      const allData: DailyTotal[] = [];
      
      // Get all departments
      const departmentsSnapshot = await getDocs(collection(this.db, 'departments'));
      
      for (const deptDoc of departmentsSnapshot.docs) {
        const deptId = deptDoc.id;
        const deptData = await this.loadDepartmentData(deptId);
        allData.push(...deptData);
      }
      
      return allData;
    } catch (error) {
      console.error('Error loading all departments data:', error);
      throw error;
    }
  }

  /**
   * Transform Firebase document data to DailyTotal type
   */
  private transformDailyData(
    dailyData: DocumentData, 
    memberData: DocumentData, 
    memberId: string, 
    teamId: string, 
    sectionId: string, 
    deptId: string
  ): DailyTotal {
    const leetcodeTotal = dailyData.leetcode_total || 0;
    const skillrackTotal = dailyData.skillrack_total || 0;
    const codechefTotal = dailyData.codechef_total || 0;
    const hackerrankTotal = dailyData.hackerrank_total || 0;
    
    return {
      id: dailyData.id || `${memberId}-${dailyData.date}`,
      date: dailyData.date,
      memberId,
      memberName: memberData.name || memberId,
      email: memberData.email || '',
      teamId,
      sectionId,
      deptId,
      leetcodeTotal,
      leetcodeDailyIncrease: dailyData.leetcode_daily_increase || 0,
      skillrackTotal,
      skillrackDailyIncrease: dailyData.skillrack_daily_increase || 0,
      codechefTotal,
      codechefDailyIncrease: dailyData.codechef_daily_increase || 0,
      hackerrankTotal,
      hackerrankDailyIncrease: dailyData.hackerrank_daily_increase || 0,
      githubRepos: dailyData.github_repos || 0,
      githubDailyIncrease: dailyData.github_daily_increase || 0,
      totalSolved: leetcodeTotal + skillrackTotal + codechefTotal + hackerrankTotal,
      totalDailyIncrease: (dailyData.leetcode_daily_increase || 0) + 
                         (dailyData.skillrack_daily_increase || 0) + 
                         (dailyData.codechef_daily_increase || 0) + 
                         (dailyData.hackerrank_daily_increase || 0)
    };
  }
}