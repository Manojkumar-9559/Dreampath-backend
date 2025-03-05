const db = require("../db");

const data = async (req, res) => {
    try {
        db.query('select * from education_levels order by id',(err,levels)=>{
            if (err) {
                console.log("Error:", err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            db.query('SELECT * FROM categories ORDER BY id', (err, categories) => {
                if (err) {
                    console.log("Error:", err);
                    return res.status(500).json({ error: 'Internal server error' });
                }
    
                db.query('SELECT * FROM courses ORDER BY id', (err, courses) => {
                    if (err) {
                        console.log("Error:", err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
    
                    // ✅ Send response after both queries complete
                    res.status(200).json({
                        message: 'Data retrieved successfully!',
                        levels,
                        categories,
                        courses
                    });
                });
            });

        })
       
    } catch (error) {
        console.log("Error:", error);
        res.status(500).json({ error: 'Internal server error' });

        
    }
};

const getCollegesByLevelId = async (req, res) => {
    try {
        const { id } = req.params;
        console.log("id:", id);

        if (!id) {
            return res.status(400).json({ message: "Level ID is required" });
        }

        const [results] = await db.promise().query("SELECT * FROM colleges WHERE education_level_id = ?", [id]);

        if (results.length === 0) {
            return res.status(404).json({ message: "Colleges not found" });
        }

        res.status(200).json({ success: true, message: "Colleges data retrieved successfully", data: results });
    } catch (error) {
        console.error("Error fetching colleges:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getEntranceExamsById = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
        // Fetch entrance exams
        const [entranceExams] = await db.promise().query(
            'SELECT * FROM entranceExams WHERE education_level_id = ?', 
            [id]
        );

        // Fetch coaching centers
        const [coachingCenters] = await db.promise().query(
            'SELECT * FROM coachingCenters WHERE education_level_id = ?', 
            [id]
        );

        console.log({ entranceExams, coachingCenters });

        if (entranceExams.length > 0 || coachingCenters.length > 0) {
            return res.status(200).json({
                message: "Data retrieved successfully",
                entranceExams,
                coachingCenters
            });
        }

        res.status(404).json({ error: "Data not found" });

    } catch (error) {
        console.log("error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


module.exports = { data,getCollegesByLevelId,getEntranceExamsById };
