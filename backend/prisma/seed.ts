import { PrismaClient, SystemRole, FamilyRole, Gender, RelationType, MediaType, EventCategory } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Legacy database with investor-demo family data...');

  // 1. Clear existing data
  await prisma.notification.deleteMany();
  await prisma.invitation.deleteMany();
  await prisma.timelineEvent.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.mediaFile.deleteMany();
  await prisma.memoryTag.deleteMany();
  await prisma.memory.deleteMany();
  await prisma.album.deleteMany();
  await prisma.relationship.deleteMany();
  await prisma.familyMember.deleteMany();
  await prisma.family.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Demo User (Eleanor Vance Sterling)
  const passwordHash = await bcrypt.hash('SecretPassword123!', 10);
  const demoUser = await prisma.user.create({
    data: {
      email: 'eleanor.sterling@example.com',
      passwordHash,
      fullName: 'Eleanor Vance Sterling',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      systemRole: SystemRole.USER,
      emailVerified: true,
    },
  });

  // 3. Create Demo Family Workspace
  const family = await prisma.family.create({
    data: {
      name: 'The Sterling Family Heritage',
      description: 'Preserving over a century of maritime history, architectural milestones, and family warmth.',
      coverUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&q=80&w=1200',
      inviteCode: 'STERLING2026',
      creatorId: demoUser.id,
    },
  });

  // 4. Create 4 Generations of Family Members
  // Gen 1: Great-Grandparents
  const arthur = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Arthur',
      lastName: 'Sterling',
      gender: Gender.MALE,
      birthDate: new Date('1898-04-12'),
      birthPlace: 'Boston, MA',
      deathDate: new Date('1972-09-18'),
      deathPlace: 'Martha’s Vineyard, MA',
      isDeceased: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
      bio: 'Captain in the US Merchant Marine and pioneering maritime architect. Built historic wooden sloops along New England.',
      occupation: 'Maritime Architect & Captain',
      education: 'B.S. Naval Architecture, MIT (Class of 1920)',
      achievements: 'Awarded Navy Cross for heroism in 1944. Designed over 40 ocean-going vessels.',
    },
  });

  const elizabeth = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Elizabeth',
      lastName: 'Sterling',
      maidenName: 'Vance',
      gender: Gender.FEMALE,
      birthDate: new Date('1902-11-05'),
      birthPlace: 'Providence, RI',
      deathDate: new Date('1985-03-24'),
      deathPlace: 'Boston, MA',
      isDeceased: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400',
      bio: 'Botanist and founder of the Boston Botanical Guild. Authored New England Flora in 1952.',
      occupation: 'Botanist & Author',
      education: 'B.A. Wellesley College',
    },
  });

  // Gen 2: Grandparents
  const william = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'William',
      lastName: 'Sterling',
      gender: Gender.MALE,
      birthDate: new Date('1928-08-14'),
      birthPlace: 'Boston, MA',
      deathDate: new Date('2015-12-01'),
      deathPlace: 'Cambridge, MA',
      isDeceased: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
      bio: 'Distinguished Professor of History at Harvard University. Beloved patriarch of the family.',
      occupation: 'Professor of History',
      education: 'Ph.D. Harvard University, B.A. Yale University',
    },
  });

  const margaret = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Margaret',
      lastName: 'Sterling',
      maidenName: 'DuPont',
      gender: Gender.FEMALE,
      birthDate: new Date('1932-03-29'),
      birthPlace: 'Wilmington, DE',
      deathDate: new Date('2020-07-11'),
      deathPlace: 'Cambridge, MA',
      isDeceased: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400',
      bio: 'Concert pianist and patron of the Boston Symphony Orchestra.',
      occupation: 'Concert Pianist',
      education: 'Juilliard School of Music',
    },
  });

  // Gen 3: Parents (Eleanor is linked to Demo User)
  const robert = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Robert',
      lastName: 'Sterling',
      gender: Gender.MALE,
      birthDate: new Date('1958-06-22'),
      birthPlace: 'Cambridge, MA',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=400',
      bio: 'Senior Partner in Sustainable Urban Planning. Passionate sailor and landscape photographer.',
      occupation: 'Architect & Urban Planner',
      education: 'M.Arch Harvard Graduate School of Design',
      role: FamilyRole.ADMIN,
    },
  });

  const eleanor = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      userId: demoUser.id,
      firstName: 'Eleanor',
      lastName: 'Sterling',
      maidenName: 'Vance',
      gender: Gender.FEMALE,
      birthDate: new Date('1962-10-18'),
      birthPlace: 'Concord, MA',
      avatarUrl: demoUser.avatarUrl,
      bio: 'Environmental Attorney and Keeper of Family Archives. Dedicated to preserving generations of history.',
      occupation: 'Environmental Attorney',
      education: 'J.D. Columbia Law School, B.A. Smith College',
      role: FamilyRole.OWNER,
    },
  });

  // Gen 4: Children
  const julian = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Julian',
      lastName: 'Sterling',
      gender: Gender.MALE,
      birthDate: new Date('1990-02-14'),
      birthPlace: 'Boston, MA',
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400',
      bio: 'Software Architect and AI Researcher in San Francisco. Loves mountain biking and sourdough baking.',
      occupation: 'AI Research Engineer',
      education: 'M.S. Stanford University, B.S. UC Berkeley',
      role: FamilyRole.MEMBER,
    },
  });

  const clara = await prisma.familyMember.create({
    data: {
      familyId: family.id,
      firstName: 'Clara',
      lastName: 'Sterling',
      gender: Gender.FEMALE,
      birthDate: new Date('1994-09-08'),
      birthPlace: 'Boston, MA',
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=400',
      bio: 'Documentary Filmmaker and Journalist based in Brooklyn, NY.',
      occupation: 'Documentary Director',
      education: 'B.A. NYU Tisch School of the Arts',
      role: FamilyRole.MEMBER,
    },
  });

  // 5. Establish Multi-Generational Relationships
  // Gen 1 -> Gen 2
  await prisma.relationship.createMany({
    data: [
      { fromMemberId: arthur.id, toMemberId: elizabeth.id, relationType: RelationType.SPOUSE },
      { fromMemberId: arthur.id, toMemberId: william.id, relationType: RelationType.FATHER },
      { fromMemberId: elizabeth.id, toMemberId: william.id, relationType: RelationType.MOTHER },
      // Gen 2 -> Gen 3
      { fromMemberId: william.id, toMemberId: margaret.id, relationType: RelationType.SPOUSE },
      { fromMemberId: william.id, toMemberId: robert.id, relationType: RelationType.FATHER },
      { fromMemberId: margaret.id, toMemberId: robert.id, relationType: RelationType.MOTHER },
      // Gen 3 -> Gen 4
      { fromMemberId: robert.id, toMemberId: eleanor.id, relationType: RelationType.SPOUSE },
      { fromMemberId: robert.id, toMemberId: julian.id, relationType: RelationType.FATHER },
      { fromMemberId: eleanor.id, toMemberId: julian.id, relationType: RelationType.MOTHER },
      { fromMemberId: robert.id, toMemberId: clara.id, relationType: RelationType.FATHER },
      { fromMemberId: eleanor.id, toMemberId: clara.id, relationType: RelationType.MOTHER },
      { fromMemberId: julian.id, toMemberId: clara.id, relationType: RelationType.SIBLING },
    ],
  });

  // 6. Create Albums & Memories
  const capeCodAlbum = await prisma.album.create({
    data: {
      familyId: family.id,
      title: 'Summers at Cape Cod Cottage',
      description: 'Fifty years of summer sun, sailing, lobster bakes, and porch discussions.',
      coverUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=800',
    },
  });

  const travelAlbum = await prisma.album.create({
    data: {
      familyId: family.id,
      title: 'European Expeditions & Grand Tours',
      description: 'Memories from William and Margaret’s sabbaticals across Europe.',
      coverUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&q=80&w=800',
    },
  });

  const memory1 = await prisma.memory.create({
    data: {
      familyId: family.id,
      albumId: capeCodAlbum.id,
      title: 'Golden Sunset Regatta at Chatham Light',
      description: 'Robert and Eleanor took the wooden sloop out past Chatham Light. Perfect breeze and golden afternoon light.',
      location: 'Chatham, Cape Cod, MA',
      memoryDate: new Date('1988-07-20'),
      mediaFiles: {
        create: [
          {
            fileUrl: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&q=80&w=1000',
            fileKey: 'sunset-regatta-1988',
            fileType: MediaType.PHOTO,
            fileName: 'sunset_regatta_1988.jpg',
            fileSize: 3420000,
            mimeType: 'image/jpeg',
          },
        ],
      },
      taggedMembers: {
        create: [{ memberId: robert.id }, { memberId: eleanor.id }],
      },
      comments: {
        create: [
          {
            authorId: demoUser.id,
            content: 'I still remember the smell of saltwater and fresh pine that evening! One of my favorite days with Robert.',
          },
        ],
      },
      reactions: {
        create: [
          { authorId: demoUser.id, emoji: '❤️' },
          { authorId: demoUser.id, emoji: '⛵' },
        ],
      },
    },
  });

  // 7. Timeline Events
  await prisma.timelineEvent.createMany({
    data: [
      {
        familyId: family.id,
        memberId: arthur.id,
        title: 'Launched Wooden Sloop "Wanderer"',
        category: EventCategory.CAREER,
        eventDate: new Date('1934-06-15'),
        location: 'Marblehead, MA',
        description: 'Completed construction of 42-foot yawl that set regional cruising records.',
      },
      {
        familyId: family.id,
        memberId: william.id,
        title: 'Appointed Chair of History Department',
        category: EventCategory.CAREER,
        eventDate: new Date('1975-09-01'),
        location: 'Harvard University',
        description: 'Named Henry Charles Lea Professor of History.',
      },
      {
        familyId: family.id,
        memberId: robert.id,
        title: 'Marriage of Robert & Eleanor',
        category: EventCategory.MARRIAGE,
        eventDate: new Date('1986-05-17'),
        location: 'Concord, MA',
        description: 'Celebrated at the historic Old Manse garden overlooking the Concord River.',
      },
      {
        familyId: family.id,
        memberId: julian.id,
        title: 'Stanford University Graduation',
        category: EventCategory.EDUCATION,
        eventDate: new Date('1990-02-14'),
        location: 'Palo Alto, CA',
        description: 'Completed M.S. in Computer Science with distinction.',
      },
    ],
  });

  // 8. Demo Notifications
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Upcoming Birthday 🎉',
        body: 'Robert Sterling turning 68 on June 22nd!',
        type: 'BIRTHDAY',
        actionUrl: `/members/${robert.id}`,
      },
      {
        userId: demoUser.id,
        title: 'New Memory Added',
        body: 'Julian added 3 photos to "Summers at Cape Cod Cottage"',
        type: 'MEMORY_ADDED',
        actionUrl: `/memories/${memory1.id}`,
      },
    ],
  });

  console.log('✅ Legacy database seeded successfully with 4-generation family history!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
