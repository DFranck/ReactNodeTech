const MeetingHistory = require('../../model/schema/meeting');
const mongoose = require('mongoose');

const add = async (req, res) => {
  try {
    const meeting = new MeetingHistory(req.body);
    const saved = await meeting.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const index = async (req, res) => {
  try {
    const meetings = await MeetingHistory.find({ deleted: false }).sort({
      timestamp: -1,
    }); // sort by latest (uses timestamp instead of createdAt)
    res.status(200).json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const view = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    const meeting = await MeetingHistory.findById(req.params.id);

    if (!meeting) return res.status(404).json({ error: 'Not found' });

    res.status(200).json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteData = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' });
    }

    // await MeetingHistory.findByIdAndDelete(req.params.id); // for really delete
    await MeetingHistory.findByIdAndUpdate(req.params.id, { deleted: true }); // for soft delete

    res.status(204).end();
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteMany = async (req, res) => {
  try {
    const { ids } = req.body;

    const validIds = ids.filter((id) => mongoose.Types.ObjectId.isValid(id));
    if (validIds.length === 0) {
      return res.status(400).json({ error: 'No valid ObjectIds provided' });
    }

    // await MeetingHistory.deleteMany({ _id: { $in: validIds } }); // for really delete
    await MeetingHistory.updateMany(
      { _id: { $in: validIds } },
      { $set: { deleted: true } }
    ); // for soft delete
    res.status(200).json({ message: 'Meetings deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { add, index, view, deleteData, deleteMany };
