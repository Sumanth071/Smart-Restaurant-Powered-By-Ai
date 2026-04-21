import EntityManagerPage from "./EntityManagerPage";
import { moduleConfigs } from "../../data/moduleConfigs";

const TablesPage = () => <EntityManagerPage config={moduleConfigs.tables} moduleKey="tables" />;

export default TablesPage;
