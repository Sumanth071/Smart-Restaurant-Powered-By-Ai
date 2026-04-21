import EntityManagerPage from "./EntityManagerPage";
import { moduleConfigs } from "../../data/moduleConfigs";

const ReservationsPage = () => <EntityManagerPage config={moduleConfigs.reservations} moduleKey="reservations" />;

export default ReservationsPage;
