// routes/groupRoutes.js
const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient'); // your Prisma client

//  Create a new group
// POST /api/groups/create
router.post('/create', async (req, res) => {
  const { name, createdBy, memberIds } = req.body; // name of group, user creating it, initial members

  try {
    // Create the group
    const group = await prisma.group.create({
      data: {
        name,
        createdBy: Number(createdBy)
      }
    });

    // Add initial members to GroupMember table
      const membersToAdd = [createdBy, ...(memberIds || [])];
      await Promise.all(
        memberIds.map(userId => 
          prisma.groupMember.create({
            data: {
              groupId: group.id,
              userId: Number(userId)
            }
          })
        )
      );
    

    res.json({ group, message: 'Group created successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

//  Add a member to a group
// POST /api/groups/:groupId/add-member
router.post('/:groupId/add-member', async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    const member = await prisma.groupMember.create({
      data: { groupId: Number(groupId), userId: Number(userId) }
    });
    res.json({ member, message: 'User added to group successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add user to group' });
  }
});

//  Fetch all groups for a user
// GET /api/groups/my-groups/:userId
router.get('/my-groups/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const memberships = await prisma.groupMember.findMany({
      where: { userId: Number(userId) },
      include: { group: true }
    });

    const groups = memberships.map(m => m.group);
    res.json(groups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

//  Fetch all members of a group
// GET /api/groups/:groupId/members
router.get('/:groupId/members', async (req, res) => {
  const { groupId } = req.params;

  try {
    const members = await prisma.groupMember.findMany({
      where: { groupId: Number(groupId) },
      include: { user: true } // include user info
    });
    res.json(members.map(m => m.user));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch group members' });
  }
});

module.exports = router;
