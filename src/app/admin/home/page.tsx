"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioButton } from "@/components/ui/radioButton";

const AdminRoot = () => {
  return (
    <div className={"m-5 flex w-[500px] flex-col gap-5 text-white"}>
      <div className={"flex gap-4 text-white"}>
        <Checkbox variant={"default"} defaultChecked>
          teste 1
        </Checkbox>
        <Checkbox variant={"admin"} defaultChecked>
          teste 2
        </Checkbox>
        <Checkbox variant={"constructive"} defaultChecked>
          teste 3
        </Checkbox>
        <Checkbox variant={"destructive"} defaultChecked>
          teste 4
        </Checkbox>
      </div>
      <div className={"flex gap-4 text-white"}>
        <RadioButton variant={"default"} name={"teste"}>
          teste 1
        </RadioButton>
        <RadioButton variant={"admin"} name={"teste"} defaultChecked>
          teste 2
        </RadioButton>
        <RadioButton variant={"constructive"} name={"teste"}>
          teste 3
        </RadioButton>
        <RadioButton variant={"destructive"} name={"teste"}>
          teste 4
        </RadioButton>
      </div>
      <div className={"flex flex-col gap-2"}>
        <div className={"flex gap-2"}>
          <Button variant={"default"}>
            <span className={"-mb-1"}>teste 1</span>
          </Button>
          <Button variant={"admin"}>
            <span className={"-mb-1"}>teste 2</span>
          </Button>
          <Button variant={"constructive"}>
            <span className={"-mb-1"}>teste 3</span>
          </Button>
          <Button variant={"destructive"}>
            <span className={"-mb-1"}>teste 4</span>
          </Button>
        </div>
        <div className={"flex gap-2"}>
          <Button variant={"default"} aria-disabled={true}>
            <span className={"-mb-1"}>teste 1</span>
          </Button>
          <Button variant={"admin"} aria-disabled={true}>
            <span className={"-mb-1"}>teste 2</span>
          </Button>
          <Button variant={"constructive"} aria-disabled={true}>
            <span className={"-mb-1"}>teste 3</span>
          </Button>
          <Button variant={"destructive"} aria-disabled={true}>
            <span className={"-mb-1"}>teste 4</span>
          </Button>
        </div>
      </div>
      <div className={"flex flex-col gap-2 "}>
        <Input variant={"neutral"} />
        <Input variant={"constructive"} />
        <Input variant={"destructive"} />
      </div>
    </div>
  );
};

export default AdminRoot;
