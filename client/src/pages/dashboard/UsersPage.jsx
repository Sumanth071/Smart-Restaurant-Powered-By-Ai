import EntityManagerPage from "./EntityManagerPage";
import { moduleConfigs } from "../../data/moduleConfigs";

const UsersPage = () => <EntityManagerPage config={moduleConfigs.users} moduleKey="users" />;

export default UsersPage;
