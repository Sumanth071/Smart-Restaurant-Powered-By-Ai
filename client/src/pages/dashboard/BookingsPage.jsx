import EntityManagerPage from "./EntityManagerPage";
import { moduleConfigs } from "../../data/moduleConfigs";

const BookingsPage = () => <EntityManagerPage config={moduleConfigs.bookings} moduleKey="bookings" />;

export default BookingsPage;
