import EntityManagerPage from "./EntityManagerPage";
import { moduleConfigs } from "../../data/moduleConfigs";

const RestaurantsPage = () => <EntityManagerPage config={moduleConfigs.restaurants} moduleKey="restaurants" />;

export default RestaurantsPage;
