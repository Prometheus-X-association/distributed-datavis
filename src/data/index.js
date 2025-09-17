import courses from "./Courses";
import digitalTwin from "./digitalTwin";
import FormatUtils from "./format.utils";
import jobs from "./Jobs";
import SkillsUtils from "./skills.utils";

const data = {
    courses,
    jobs,
    digitalTwin,
    utils: { 
        skills : SkillsUtils,
        format: FormatUtils,
    },
}

export default data;