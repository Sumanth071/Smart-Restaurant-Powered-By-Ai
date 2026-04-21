import EntityManagerPage from "./EntityManagerPage";
import { moduleConfigs } from "../../data/moduleConfigs";

const OrdersPage = () => <EntityManagerPage config={moduleConfigs.orders} moduleKey="orders" />;

export default OrdersPage;
