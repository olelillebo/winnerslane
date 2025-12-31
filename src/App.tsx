import { Link } from "@heroui/react";
import Activity from "./Components/Activity";
import { PasteData } from "./Components/PasteData";

import { useActivityContext } from "./Context/ActivityContext";

function App() {
  const { activities } = useActivityContext();
  return (
    <div className="mx-auto  min-h-screen bg-[#121212] p-3">
      <div className="mx-auto max-w-5xl   ">
        {activities && activities?.length ? (
          activities?.map((activity) => (
            <Activity key={activity.id} activityId={activity.id} />
          ))
        ) : (
          <div className="mt-20 flex flex-col items-center gap-3">
            <div className=" text-center text-white/80">
              No activities loaded.
            </div>
            <PasteData />

            <Link
              href="https://app.court22.com/#/venues/34047bc5-91c6-4097-9f95-a52fe74c8833"
              className="text-white"
              target="_blank"
            >
              Data url
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
