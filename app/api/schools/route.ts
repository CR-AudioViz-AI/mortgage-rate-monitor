// CR AudioViz AI - Mortgage Rate Monitor
// SCHOOL DISTRICT API - Ratings, Scores & Family Appeal
// December 22, 2025
// Source: Florida DOE, NCES, GreatSchools

import { NextRequest, NextResponse } from 'next/server';

// ============================================
// FLORIDA SCHOOL DISTRICT DATA
// ============================================

interface SchoolDistrict {
  district: string;
  county: string;
  overallRating: number; // 1-10
  letterGrade: string;
  totalSchools: number;
  totalStudents: number;
  studentTeacherRatio: number;
  graduationRate: number;
  collegeReadiness: number;
  testScores: {
    mathProficiency: number;
    readingProficiency: number;
    scienceProficiency: number;
  };
  perPupilSpending: number;
  highlights: string[];
  challenges: string[];
  topSchools: { name: string; type: string; rating: number }[];
}

const FLORIDA_DISTRICTS: Record<string, SchoolDistrict> = {
  'LEE': {
    district: 'School District of Lee County',
    county: 'Lee',
    overallRating: 6,
    letterGrade: 'B',
    totalSchools: 128,
    totalStudents: 95000,
    studentTeacherRatio: 16.5,
    graduationRate: 89.2,
    collegeReadiness: 42,
    testScores: {
      mathProficiency: 54,
      readingProficiency: 52,
      scienceProficiency: 48
    },
    perPupilSpending: 10250,
    highlights: ['Strong magnet programs', 'Growing STEM focus', 'Multiple A-rated schools'],
    challenges: ['Teacher retention', 'Rapid growth strain'],
    topSchools: [
      { name: 'Fort Myers High School', type: 'High', rating: 8 },
      { name: 'Canterbury School', type: 'K-12 Private', rating: 9 },
      { name: 'Three Oaks Elementary', type: 'Elementary', rating: 8 }
    ]
  },
  'COLLIER': {
    district: 'Collier County Public Schools',
    county: 'Collier',
    overallRating: 7,
    letterGrade: 'A',
    totalSchools: 65,
    totalStudents: 48000,
    studentTeacherRatio: 15.8,
    graduationRate: 92.5,
    collegeReadiness: 48,
    testScores: {
      mathProficiency: 62,
      readingProficiency: 58,
      scienceProficiency: 55
    },
    perPupilSpending: 11850,
    highlights: ['A-rated district', 'Strong arts programs', 'High graduation rate'],
    challenges: ['Cost of living for teachers'],
    topSchools: [
      { name: 'Naples High School', type: 'High', rating: 8 },
      { name: 'Barron Collier High School', type: 'High', rating: 8 },
      { name: 'Seacrest Country Day School', type: 'K-12 Private', rating: 9 }
    ]
  },
  'MIAMI-DADE': {
    district: 'Miami-Dade County Public Schools',
    county: 'Miami-Dade',
    overallRating: 6,
    letterGrade: 'B',
    totalSchools: 392,
    totalStudents: 345000,
    studentTeacherRatio: 18.2,
    graduationRate: 85.8,
    collegeReadiness: 38,
    testScores: {
      mathProficiency: 48,
      readingProficiency: 50,
      scienceProficiency: 45
    },
    perPupilSpending: 10850,
    highlights: ['Largest district in FL', 'Many magnet options', 'IB programs'],
    challenges: ['Size management', 'Funding per student'],
    topSchools: [
      { name: 'Design & Architecture Senior High', type: 'High', rating: 10 },
      { name: 'MAST Academy', type: 'High', rating: 9 },
      { name: 'Coral Gables Senior High', type: 'High', rating: 8 }
    ]
  },
  'BROWARD': {
    district: 'Broward County Public Schools',
    county: 'Broward',
    overallRating: 6,
    letterGrade: 'B',
    totalSchools: 234,
    totalStudents: 261000,
    studentTeacherRatio: 17.5,
    graduationRate: 87.2,
    collegeReadiness: 40,
    testScores: {
      mathProficiency: 50,
      readingProficiency: 52,
      scienceProficiency: 47
    },
    perPupilSpending: 10450,
    highlights: ['Strong magnet schools', 'Dual enrollment options', 'Technical programs'],
    challenges: ['Safety concerns', 'Infrastructure needs'],
    topSchools: [
      { name: 'Pine Crest School', type: 'K-12 Private', rating: 10 },
      { name: 'Cypress Bay High School', type: 'High', rating: 8 },
      { name: 'American Heritage School', type: 'K-12 Private', rating: 9 }
    ]
  },
  'ORANGE': {
    district: 'Orange County Public Schools',
    county: 'Orange',
    overallRating: 6,
    letterGrade: 'B',
    totalSchools: 203,
    totalStudents: 212000,
    studentTeacherRatio: 17.2,
    graduationRate: 88.5,
    collegeReadiness: 42,
    testScores: {
      mathProficiency: 52,
      readingProficiency: 54,
      scienceProficiency: 49
    },
    perPupilSpending: 10150,
    highlights: ['Growing district', 'Theme park partnerships', 'Career academies'],
    challenges: ['Rapid growth', 'Teacher shortage'],
    topSchools: [
      { name: 'Trinity Preparatory School', type: 'K-12 Private', rating: 9 },
      { name: 'Winter Park High School', type: 'High', rating: 8 },
      { name: 'Lake Highland Preparatory', type: 'K-12 Private', rating: 9 }
    ]
  },
  'HILLSBOROUGH': {
    district: 'Hillsborough County Public Schools',
    county: 'Hillsborough',
    overallRating: 6,
    letterGrade: 'B',
    totalSchools: 245,
    totalStudents: 228000,
    studentTeacherRatio: 17.8,
    graduationRate: 86.8,
    collegeReadiness: 38,
    testScores: {
      mathProficiency: 49,
      readingProficiency: 51,
      scienceProficiency: 46
    },
    perPupilSpending: 9850,
    highlights: ['Magnet programs', 'IB offerings', 'Career technical education'],
    challenges: ['Urban/suburban divide', 'Funding disparities'],
    topSchools: [
      { name: 'Berkeley Preparatory School', type: 'K-12 Private', rating: 10 },
      { name: 'Plant High School', type: 'High', rating: 8 },
      { name: 'Tampa Preparatory School', type: 'High Private', rating: 9 }
    ]
  },
  'PINELLAS': {
    district: 'Pinellas County Schools',
    county: 'Pinellas',
    overallRating: 6,
    letterGrade: 'B',
    totalSchools: 143,
    totalStudents: 96000,
    studentTeacherRatio: 15.5,
    graduationRate: 90.2,
    collegeReadiness: 44,
    testScores: {
      mathProficiency: 54,
      readingProficiency: 55,
      scienceProficiency: 50
    },
    perPupilSpending: 10650,
    highlights: ['High graduation rate', 'Choice programs', 'Arts focus schools'],
    challenges: ['Enrollment decline', 'Facility age'],
    topSchools: [
      { name: 'Shorecrest Preparatory School', type: 'K-12 Private', rating: 9 },
      { name: 'Palm Harbor University High', type: 'High', rating: 8 },
      { name: 'Canterbury School of Florida', type: 'K-12 Private', rating: 8 }
    ]
  },
  'DUVAL': {
    district: 'Duval County Public Schools',
    county: 'Duval',
    overallRating: 5,
    letterGrade: 'C',
    totalSchools: 163,
    totalStudents: 130000,
    studentTeacherRatio: 16.8,
    graduationRate: 84.5,
    collegeReadiness: 35,
    testScores: {
      mathProficiency: 45,
      readingProficiency: 48,
      scienceProficiency: 42
    },
    perPupilSpending: 9650,
    highlights: ['Improving scores', 'New leadership focus', 'Magnet expansion'],
    challenges: ['Achievement gaps', 'Teacher recruitment'],
    topSchools: [
      { name: 'Stanton College Preparatory', type: 'High', rating: 10 },
      { name: 'Douglas Anderson School of Arts', type: 'High', rating: 9 },
      { name: 'Bolles School', type: 'K-12 Private', rating: 10 }
    ]
  },
  'SEMINOLE': {
    district: 'Seminole County Public Schools',
    county: 'Seminole',
    overallRating: 8,
    letterGrade: 'A',
    totalSchools: 67,
    totalStudents: 68000,
    studentTeacherRatio: 15.2,
    graduationRate: 93.5,
    collegeReadiness: 52,
    testScores: {
      mathProficiency: 65,
      readingProficiency: 62,
      scienceProficiency: 58
    },
    perPupilSpending: 10950,
    highlights: ['Top-rated district', 'High test scores', 'Strong community support'],
    challenges: ['Maintaining excellence', 'Growth management'],
    topSchools: [
      { name: 'Lake Mary High School', type: 'High', rating: 9 },
      { name: 'Hagerty High School', type: 'High', rating: 8 },
      { name: 'Oviedo High School', type: 'High', rating: 8 }
    ]
  },
  'SARASOTA': {
    district: 'Sarasota County Schools',
    county: 'Sarasota',
    overallRating: 8,
    letterGrade: 'A',
    totalSchools: 51,
    totalStudents: 44000,
    studentTeacherRatio: 14.8,
    graduationRate: 94.2,
    collegeReadiness: 55,
    testScores: {
      mathProficiency: 68,
      readingProficiency: 65,
      scienceProficiency: 60
    },
    perPupilSpending: 11250,
    highlights: ['Top-performing district', 'Arts integration', 'Small class sizes'],
    challenges: ['Affordable housing for staff'],
    topSchools: [
      { name: 'Pine View School', type: 'Gifted 2-12', rating: 10 },
      { name: 'Riverview High School', type: 'High', rating: 8 },
      { name: 'Out-of-Door Academy', type: 'K-12 Private', rating: 9 }
    ]
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculateFamilyAppealScore(district: SchoolDistrict): {
  score: number;
  rating: 'excellent' | 'good' | 'average' | 'below_average';
  factors: { factor: string; score: number; weight: number }[];
} {
  const factors = [
    { factor: 'Overall Rating', score: district.overallRating * 10, weight: 0.25 },
    { factor: 'Graduation Rate', score: district.graduationRate, weight: 0.20 },
    { factor: 'College Readiness', score: district.collegeReadiness * 2, weight: 0.15 },
    { factor: 'Test Scores', score: (district.testScores.mathProficiency + district.testScores.readingProficiency) / 2, weight: 0.20 },
    { factor: 'Student-Teacher Ratio', score: Math.max(0, 100 - (district.studentTeacherRatio - 12) * 5), weight: 0.10 },
    { factor: 'Per-Pupil Spending', score: Math.min(100, (district.perPupilSpending / 120)), weight: 0.10 }
  ];
  
  const totalScore = factors.reduce((sum, f) => sum + (f.score * f.weight), 0);
  const normalizedScore = Math.round(totalScore);
  
  const rating = normalizedScore >= 75 ? 'excellent' :
                 normalizedScore >= 60 ? 'good' :
                 normalizedScore >= 45 ? 'average' : 'below_average';
  
  return { score: normalizedScore, rating, factors };
}

function getSchoolRecommendations(district: SchoolDistrict): string[] {
  const recs: string[] = [];
  
  if (district.letterGrade === 'A') {
    recs.push('✅ A-rated district - excellent choice for families');
  } else if (district.letterGrade === 'B') {
    recs.push('👍 B-rated district - good schools available');
  } else {
    recs.push('⚠️ Research individual schools carefully');
  }
  
  if (district.topSchools.some(s => s.rating >= 9)) {
    recs.push('🌟 Has top-rated schools (9+/10)');
  }
  
  if (district.graduationRate >= 90) {
    recs.push('🎓 High graduation rate (90%+)');
  }
  
  if (district.studentTeacherRatio <= 15) {
    recs.push('👩‍🏫 Low student-teacher ratio');
  }
  
  if (district.perPupilSpending >= 11000) {
    recs.push('💰 Above-average per-pupil spending');
  }
  
  return recs;
}

// ============================================
// API HANDLERS
// ============================================

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startTime = Date.now();
  
  const county = searchParams.get('county')?.toUpperCase().replace(' ', '-');
  
  try {
    if (county) {
      const district = FLORIDA_DISTRICTS[county];
      
      if (!district) {
        return NextResponse.json({
          success: false,
          error: 'District not found',
          availableDistricts: Object.keys(FLORIDA_DISTRICTS)
        }, { status: 404 });
      }
      
      const familyAppeal = calculateFamilyAppealScore(district);
      const recommendations = getSchoolRecommendations(district);
      
      return NextResponse.json({
        success: true,
        district,
        familyAppeal,
        recommendations,
        comparison: {
          vsStateAverage: {
            gradRate: Math.round((district.graduationRate - 87.5) * 10) / 10,
            testScores: Math.round(((district.testScores.mathProficiency + district.testScores.readingProficiency) / 2 - 52) * 10) / 10,
            spending: district.perPupilSpending - 10200
          }
        },
        meta: {
          responseTime: `${Date.now() - startTime}ms`,
          dataSource: 'Florida DOE, NCES, GreatSchools',
          year: '2023-24'
        }
      });
    }
    
    // Return all districts ranked
    const rankedDistricts = Object.values(FLORIDA_DISTRICTS)
      .map(d => ({
        county: d.county,
        district: d.district,
        overallRating: d.overallRating,
        letterGrade: d.letterGrade,
        graduationRate: d.graduationRate,
        familyAppealScore: calculateFamilyAppealScore(d).score
      }))
      .sort((a, b) => b.familyAppealScore - a.familyAppealScore);
    
    return NextResponse.json({
      success: true,
      rankings: rankedDistricts,
      topDistricts: rankedDistricts.slice(0, 5),
      stateAverages: {
        graduationRate: 87.5,
        mathProficiency: 52,
        readingProficiency: 53,
        perPupilSpending: 10200
      },
      usage: {
        byCounty: '/api/schools?county=LEE'
      },
      meta: {
        responseTime: `${Date.now() - startTime}ms`,
        dataSource: 'Florida DOE, NCES, GreatSchools',
        year: '2023-24'
      }
    });
    
  } catch (error) {
    console.error('Schools API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch school data'
    }, { status: 500 });
  }
}
